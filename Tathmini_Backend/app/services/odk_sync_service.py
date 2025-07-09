import asyncio
import httpx
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
import logging

from ..models.odk import ODKSyncStatus
from ..services.odk_service import (
    get_decrypted_credentials, 
    update_sync_status, 
    get_sync_status,
    log_sync_operation
)
from ..database_mongo import get_odk_forms_collection, get_odk_submissions_collection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("odk_sync")

# Active sync tasks
active_sync_tasks: Dict[str, asyncio.Task] = {}

# Sync intervals
sync_intervals = {
    'syncing': timedelta(minutes=5),
    'paused': None,
    'idle': None
}

async def start_sync_task(db: Session, project_id: str, background_tasks: BackgroundTasks):
    """Start a background sync task for a project."""
    # Check if task already exists
    if project_id in active_sync_tasks and not active_sync_tasks[project_id].done():
        logger.info(f"Sync task for project {project_id} is already running")
        return
    
    # Start the sync loop in the background
    background_tasks.add_task(_sync_loop, db, project_id)
    logger.info(f"Started sync task for project {project_id}")
    
    # Update sync status
    await update_sync_status(db, project_id, "syncing")

async def _sync_loop(db: Session, project_id: str):
    """Continuous sync loop with interval."""
    try:
        # Register task
        active_sync_tasks[project_id] = asyncio.current_task()
        
        while True:
            # Get current sync status
            sync_status = await get_sync_status(db, project_id)
            
            if sync_status.status == "paused":
                logger.info(f"Sync for project {project_id} is paused")
                await asyncio.sleep(10)  # Check every 10 seconds if paused
                continue
            
            if sync_status.status != "syncing":
                logger.info(f"Sync for project {project_id} is not active, status: {sync_status.status}")
                break
            
            try:
                # Perform sync
                logger.info(f"Starting sync for project {project_id}")
                forms_synced, submissions_synced = await _sync_project_data(db, project_id)
                
                # Log successful sync
                await log_sync_operation(
                    db, 
                    project_id, 
                    "success", 
                    f"Successfully synced {forms_synced} forms and {submissions_synced} submissions",
                    forms_synced,
                    submissions_synced
                )
                
                # Update last sync time
                sync_status = await get_sync_status(db, project_id)
                sync_status.last_sync_time = datetime.utcnow()
                sync_status.next_sync_time = datetime.utcnow() + sync_intervals.get("syncing", timedelta(minutes=5))
                db.commit()
                
                logger.info(f"Completed sync for project {project_id}")
            except Exception as e:
                # Log error
                error_message = f"Sync error for project {project_id}: {str(e)}"
                logger.error(error_message)
                await log_sync_operation(db, project_id, "failed", error_message)
            
            # Sleep until next sync
            interval = sync_intervals.get("syncing", timedelta(minutes=5))
            logger.info(f"Next sync for project {project_id} in {interval}")
            await asyncio.sleep(interval.total_seconds())
    except asyncio.CancelledError:
        logger.info(f"Sync task for project {project_id} was cancelled")
    except Exception as e:
        logger.error(f"Unexpected error in sync loop for project {project_id}: {str(e)}")
    finally:
        # Remove task from active tasks
        if project_id in active_sync_tasks:
            del active_sync_tasks[project_id]

async def _sync_project_data(db: Session, project_id: str) -> tuple[int, int]:
    """Perform actual data sync for a project."""
    # Get credentials
    credentials = await get_decrypted_credentials(db, project_id)
    
    # Get sync status to check last sync time
    sync_status = await get_sync_status(db, project_id)
    last_sync = sync_status.last_sync_time
    
    forms_synced = 0
    submissions_synced = 0
    
    async with httpx.AsyncClient() as client:
        auth = (credentials.username, credentials.password)
        
        # 1. Get project forms
        forms_url = f"{credentials.base_url}/v1/projects/{credentials.project_id}/forms"
        forms_res = await client.get(forms_url, auth=auth)
        forms_res.raise_for_status()
        forms = forms_res.json()
        
        # Get MongoDB collections
        forms_collection = await get_odk_forms_collection()
        submissions_collection = await get_odk_submissions_collection()
        
        # 2. Store forms in MongoDB
        for form in forms:
            form_id = form.get("xmlFormId")
            if not form_id:
                continue
                
            # Add project_id to form data
            form["project_id"] = project_id
            form["last_synced"] = datetime.utcnow().isoformat()
            
            # Upsert form
            await forms_collection.update_one(
                {"xmlFormId": form_id, "project_id": project_id},
                {"$set": form},
                upsert=True
            )
            forms_synced += 1
            
            # 3. For each form, get submissions since last sync
            submissions_url = f"{forms_url}/{form_id}/submissions"
            if last_sync:
                submissions_url += f"?since={last_sync.isoformat()}"
            
            try:
                submissions_res = await client.get(submissions_url, auth=auth)
                submissions_res.raise_for_status()
                submissions = submissions_res.json()
                
                # 4. Process and store submissions
                if submissions:
                    for submission in submissions:
                        # Add project_id and form_id to submission data
                        submission["project_id"] = project_id
                        submission["form_id"] = form_id
                        submission["last_synced"] = datetime.utcnow().isoformat()
                        
                        # Upsert submission
                        await submissions_collection.update_one(
                            {"instanceId": submission.get("instanceId"), "project_id": project_id},
                            {"$set": submission},
                            upsert=True
                        )
                        submissions_synced += 1
            except Exception as e:
                logger.error(f"Error syncing submissions for form {form_id}: {str(e)}")
    
    return forms_synced, submissions_synced

async def stop_sync_task(db: Session, project_id: str):
    """Stop a sync task for a project."""
    if project_id in active_sync_tasks and not active_sync_tasks[project_id].done():
        # Cancel the task
        active_sync_tasks[project_id].cancel()
        try:
            await active_sync_tasks[project_id]
        except asyncio.CancelledError:
            pass
        
        # Update sync status
        await update_sync_status(db, project_id, "paused")
        logger.info(f"Stopped sync task for project {project_id}")
    else:
        logger.info(f"No active sync task found for project {project_id}")

async def get_sync_status_for_all_projects(db: Session) -> List[Dict[str, Any]]:
    """Get sync status for all projects."""
    sync_statuses = db.query(ODKSyncStatus).all()
    return [
        {
            "project_id": status.project_id,
            "status": status.status,
            "last_sync_time": status.last_sync_time,
            "next_sync_time": status.next_sync_time,
            "is_active": status.project_id in active_sync_tasks and not active_sync_tasks[status.project_id].done()
        }
        for status in sync_statuses
    ]