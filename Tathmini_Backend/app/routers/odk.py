from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..schemas.odk import (
    ODKCredentialsCreate, 
    ODKCredentialsResponse, 
    SyncStatusUpdate, 
    SyncStatusResponse,
    SyncLogResponse
)
from ..services.odk_service import (
    validate_odk_credentials,
    encrypt_credentials,
    store_credentials,
    get_credentials,
    update_sync_status,
    get_sync_status,
    get_sync_logs
)
from ..services.odk_sync_service import (
    start_sync_task,
    stop_sync_task,
    get_sync_status_for_all_projects
)

router = APIRouter(prefix="/odk", tags=["ODK Integration"])

@router.get("/test")
async def test_odk_router():
    """Test endpoint for ODK router."""
    return {"status": "ok", "message": "ODK router is working"}

@router.post("/projects/{project_id}/connect", response_model=ODKCredentialsResponse)
async def connect_odk(
    project_id: str,
    credentials: ODKCredentialsCreate,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """Connect to ODK Central and store credentials."""
    print(f"Received connect request for project_id: {project_id}")
    print(f"Credentials: {credentials.dict(exclude={'password'})}")
    
    try:
        # Validate credentials
        print("Starting credentials validation...")
        await validate_odk_credentials(credentials)
        print("Credentials validation successful")
        
        # Encrypt and store credentials
        print("Encrypting credentials...")
        try:
            encrypted_credentials = await encrypt_credentials(credentials)
            print("Credentials encrypted successfully")
        except Exception as encryption_error:
            print(f"Encryption error: {str(encryption_error)}")
            raise HTTPException(status_code=500, detail=f"Failed to encrypt credentials: {str(encryption_error)}")
        
        try:
            print(f"Storing credentials for project {project_id}...")
            stored_credentials = await store_credentials(db, project_id, encrypted_credentials)
            print(f"Credentials stored successfully for project {project_id}")
            
            # Start sync task if background_tasks is provided
            if background_tasks:
                print(f"Starting sync task for project {project_id}...")
                await start_sync_task(db, project_id, background_tasks)
                print(f"Sync task started for project {project_id}")
            
            return {
                "project_id": stored_credentials.project_id,
                "is_connected": True,
                "created_at": stored_credentials.created_at,
                "updated_at": stored_credentials.updated_at
            }
        except Exception as storage_error:
            print(f"Error storing credentials: {str(storage_error)}")
            raise HTTPException(status_code=500, detail=f"Failed to store credentials: {str(storage_error)}")
    except HTTPException as http_exc:
        print(f"HTTP exception in connect_odk: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        print(f"Unexpected error in connect_odk: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/projects/{project_id}/status", response_model=SyncStatusResponse)
async def get_odk_sync_status(project_id: str, db: Session = Depends(get_db)):
    """Get ODK sync status for a project."""
    try:
        sync_status = await get_sync_status(db, project_id)
        return {
            "project_id": sync_status.project_id,
            "status": sync_status.status,
            "last_sync_time": sync_status.last_sync_time,
            "next_sync_time": sync_status.next_sync_time,
            "updated_at": sync_status.updated_at
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/projects/{project_id}/sync", response_model=SyncStatusResponse)
async def update_odk_sync_status(
    project_id: str,
    status_update: SyncStatusUpdate,
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = None
):
    """Update ODK sync status (start/pause sync)."""
    try:
        # Check if credentials exist
        await get_credentials(db, project_id)
        
        if status_update.status == "syncing":
            # Start sync task
            if background_tasks:
                await start_sync_task(db, project_id, background_tasks)
        elif status_update.status == "paused":
            # Stop sync task
            await stop_sync_task(db, project_id)
        else:
            raise HTTPException(status_code=400, detail=f"Invalid status: {status_update.status}")
        
        # Get updated sync status
        sync_status = await get_sync_status(db, project_id)
        return {
            "project_id": sync_status.project_id,
            "status": sync_status.status,
            "last_sync_time": sync_status.last_sync_time,
            "next_sync_time": sync_status.next_sync_time,
            "updated_at": sync_status.updated_at
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/projects/{project_id}/logs", response_model=List[SyncLogResponse])
async def get_odk_sync_logs(project_id: str, limit: int = 10, db: Session = Depends(get_db)):
    """Get ODK sync logs for a project."""
    try:
        logs = await get_sync_logs(db, project_id, limit)
        return logs
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/status", response_model=List[dict])
async def get_all_projects_sync_status(db: Session = Depends(get_db)):
    """Get sync status for all projects."""
    try:
        return await get_sync_status_for_all_projects(db)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))