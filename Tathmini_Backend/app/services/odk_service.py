import os
import httpx
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
import json
from sqlalchemy.orm import Session
from fastapi import HTTPException

from ..models.odk import ODKCredentials, ODKSyncStatus, ODKSyncLog
from ..schemas.odk import ODKCredentialsBase
from ..config import settings

# Ensure the encryption key is set
if not settings.ENCRYPTION_KEY:
    raise ValueError("ENCRYPTION_KEY must be set in environment variables")

# Initialize encryption
fernet = Fernet(settings.ENCRYPTION_KEY.encode() if isinstance(settings.ENCRYPTION_KEY, str) else settings.ENCRYPTION_KEY)

async def encrypt_credentials(credentials: ODKCredentialsBase) -> str:
    """Encrypt ODK credentials."""
    # Normalize the base_url to prevent double slashes
    credentials_dict = credentials.dict()
    credentials_dict["base_url"] = credentials_dict["base_url"].rstrip('/')
    
    credentials_json = json.dumps(credentials_dict)
    return fernet.encrypt(credentials_json.encode()).decode()

async def decrypt_credentials(encrypted_credentials: str) -> ODKCredentialsBase:
    """Decrypt ODK credentials."""
    try:
        decrypted_json = fernet.decrypt(encrypted_credentials.encode()).decode()
        credentials_dict = json.loads(decrypted_json)
        return ODKCredentialsBase(**credentials_dict)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to decrypt credentials: {str(e)}")

async def validate_odk_credentials(credentials: ODKCredentialsBase) -> bool:
    """Validate ODK credentials by making a test request to ODK Central."""
    try:
        print(f"Validating ODK credentials for base_url: {credentials.base_url}, username: {credentials.username}, project_id: {credentials.project_id}")
        
        # Validate required fields
        if not credentials.base_url:
            raise HTTPException(status_code=400, detail="Base URL is required")
        if not credentials.username:
            raise HTTPException(status_code=400, detail="Username is required")
        if not credentials.password:
            raise HTTPException(status_code=400, detail="Password is required")
        if not credentials.project_id:
            raise HTTPException(status_code=400, detail="Project ID is required")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            auth = (credentials.username, credentials.password)
            
            # First, check if the base authentication works
            base_url = credentials.base_url.rstrip('/')  # Remove trailing slash if present
            test_url = f"{base_url}/v1/projects"
            print(f"Testing base authentication with URL: {test_url}")
            
            try:
                response = await client.get(test_url, auth=auth)
                print(f"Base authentication response status: {response.status_code}")
                response.raise_for_status()
                print("Base authentication successful")
            except httpx.HTTPStatusError as status_error:
                print(f"Base authentication failed with status code: {status_error.response.status_code}")
                if status_error.response.status_code == 401:
                    raise HTTPException(status_code=400, detail="Authentication failed: Invalid username or password")
                else:
                    raise HTTPException(status_code=400, detail=f"Base authentication failed with status code: {status_error.response.status_code}")
            except httpx.RequestError as request_error:
                print(f"Base authentication failed with request error: {str(request_error)}")
                raise HTTPException(status_code=400, detail=f"Cannot connect to ODK Central: {str(request_error)}")
            except Exception as base_auth_error:
                print(f"Base authentication failed: {str(base_auth_error)}")
                raise HTTPException(status_code=400, detail=f"Base authentication failed: {str(base_auth_error)}")
            
            # Then, check if the specific project exists
            project_url = f"{base_url}/v1/projects/{credentials.project_id}"
            print(f"Testing project existence with URL: {project_url}")
            
            try:
                project_response = await client.get(project_url, auth=auth)
                print(f"Project existence response status: {project_response.status_code}")
                project_response.raise_for_status()
                print(f"Project {credentials.project_id} exists")
            except httpx.HTTPStatusError as status_error:
                print(f"Project validation failed with status code: {status_error.response.status_code}")
                if status_error.response.status_code == 404:
                    raise HTTPException(status_code=400, detail=f"Project ID {credentials.project_id} not found")
                else:
                    raise HTTPException(status_code=400, detail=f"Project validation failed with status code: {status_error.response.status_code}")
            except Exception as project_error:
                print(f"Project validation failed: {str(project_error)}")
                raise HTTPException(status_code=400, detail=f"Project validation failed: {str(project_error)}")
            
            # Optionally, check for a specific form if provided in the URL
            try:
                form_url = f"{base_url}/v1/projects/{credentials.project_id}/forms/malnutrition_test_v1"
                print(f"Testing form existence with URL: {form_url}")
                form_response = await client.get(form_url, auth=auth)
                print(f"Form existence response status: {form_response.status_code}")
                form_response.raise_for_status()
                print(f"Successfully validated form: malnutrition_test_v1")
            except Exception as form_error:
                print(f"Form validation warning (not critical): {str(form_error)}")
                # We don't fail if the specific form doesn't exist, as it's just an additional check
            
            return True
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions
        raise http_exc
    except Exception as e:
        print(f"Unexpected error during validation: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid ODK credentials: {str(e)}")

async def store_credentials(db: Session, project_id: str, encrypted_credentials: str) -> ODKCredentials:
    """Store encrypted ODK credentials in the database."""
    try:
        # Check if credentials already exist for this project
        print(f"Checking if credentials exist for project {project_id}")
        existing_credentials = db.query(ODKCredentials).filter(ODKCredentials.project_id == project_id).first()
        
        if existing_credentials:
            print(f"Updating existing credentials for project {project_id}")
            # Update existing credentials
            existing_credentials.encrypted_credentials = encrypted_credentials
            existing_credentials.updated_at = datetime.utcnow()
            try:
                db.commit()
                db.refresh(existing_credentials)
                print(f"Successfully updated credentials for project {project_id}")
                return existing_credentials
            except Exception as update_error:
                db.rollback()
                error_msg = f"Failed to update credentials: {str(update_error)}"
                print(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
        else:
            print(f"Creating new credentials for project {project_id}")
            
            # First, check if there are any existing sync statuses for this project
            # and delete them to avoid foreign key constraint issues
            try:
                existing_sync_status = db.query(ODKSyncStatus).filter(ODKSyncStatus.project_id == project_id).first()
                if existing_sync_status:
                    db.delete(existing_sync_status)
                    db.commit()
                    print(f"Deleted existing sync status for project {project_id}")
            except Exception as delete_error:
                db.rollback()
                print(f"Error deleting existing sync status: {str(delete_error)}")
                # Continue even if deletion fails
            
            # Create new credentials
            try:
                new_credentials = ODKCredentials(
                    project_id=project_id,
                    encrypted_credentials=encrypted_credentials
                )
                db.add(new_credentials)
                db.commit()
                db.refresh(new_credentials)
                print(f"Successfully created new credentials for project {project_id}")
            except Exception as create_error:
                db.rollback()
                error_msg = f"Failed to create credentials: {str(create_error)}"
                print(error_msg)
                raise HTTPException(status_code=500, detail=error_msg)
            
            try:
                # Initialize sync status
                new_sync_status = ODKSyncStatus(
                    project_id=project_id,
                    status="idle",
                    last_sync_time=None,
                    next_sync_time=None
                )
                db.add(new_sync_status)
                db.commit()
                print(f"Created new sync status for project {project_id}")
            except Exception as sync_error:
                db.rollback()
                print(f"Error initializing sync status: {str(sync_error)}")
                # Continue even if sync status creation fails - we already have the credentials
            
            return new_credentials
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions
        raise http_exc
    except Exception as e:
        db.rollback()
        error_msg = f"Unexpected database error: {str(e)}"
        print(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

async def get_credentials(db: Session, project_id: str) -> ODKCredentials:
    """Get ODK credentials from the database."""
    credentials = db.query(ODKCredentials).filter(ODKCredentials.project_id == project_id).first()
    if not credentials:
        raise HTTPException(status_code=404, detail=f"ODK credentials not found for project {project_id}")
    return credentials

async def get_decrypted_credentials(db: Session, project_id: str) -> ODKCredentialsBase:
    """Get and decrypt ODK credentials."""
    credentials = await get_credentials(db, project_id)
    return await decrypt_credentials(credentials.encrypted_credentials)

async def update_sync_status(db: Session, project_id: str, status: str) -> ODKSyncStatus:
    """Update ODK sync status."""
    sync_status = db.query(ODKSyncStatus).filter(ODKSyncStatus.project_id == project_id).first()
    if not sync_status:
        raise HTTPException(status_code=404, detail=f"ODK sync status not found for project {project_id}")
    
    sync_status.status = status
    sync_status.updated_at = datetime.utcnow()
    
    # Set next sync time if syncing
    if status == "syncing":
        sync_status.next_sync_time = datetime.utcnow() + timedelta(minutes=5)
    else:
        sync_status.next_sync_time = None
    
    db.commit()
    db.refresh(sync_status)
    return sync_status

async def get_sync_status(db: Session, project_id: str) -> ODKSyncStatus:
    """Get ODK sync status."""
    sync_status = db.query(ODKSyncStatus).filter(ODKSyncStatus.project_id == project_id).first()
    if not sync_status:
        raise HTTPException(status_code=404, detail=f"ODK sync status not found for project {project_id}")
    return sync_status

async def log_sync_operation(
    db: Session, 
    project_id: str, 
    status: str, 
    message: str = None, 
    forms_synced: int = 0, 
    submissions_synced: int = 0
) -> ODKSyncLog:
    """Log ODK sync operation."""
    sync_log = ODKSyncLog(
        project_id=project_id,
        status=status,
        message=message,
        forms_synced=forms_synced,
        submissions_synced=submissions_synced
    )
    db.add(sync_log)
    db.commit()
    db.refresh(sync_log)
    return sync_log

async def get_sync_logs(db: Session, project_id: str, limit: int = 10):
    """Get ODK sync logs for a project."""
    return db.query(ODKSyncLog).filter(
        ODKSyncLog.project_id == project_id
    ).order_by(ODKSyncLog.sync_time.desc()).limit(limit).all()