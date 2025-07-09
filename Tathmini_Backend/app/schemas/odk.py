from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ODKCredentialsBase(BaseModel):
    """Base schema for ODK credentials."""
    base_url: str
    username: str
    password: str
    project_id: str

class ODKCredentialsCreate(ODKCredentialsBase):
    """Schema for creating ODK credentials."""
    pass

class ODKCredentialsResponse(BaseModel):
    """Schema for ODK credentials response."""
    project_id: str
    is_connected: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class SyncStatusUpdate(BaseModel):
    """Schema for updating sync status."""
    status: str = Field(..., description="Sync status: 'syncing', 'paused', or 'idle'")

class SyncStatusResponse(BaseModel):
    """Schema for sync status response."""
    project_id: str
    status: str
    last_sync_time: Optional[datetime] = None
    next_sync_time: Optional[datetime] = None
    updated_at: datetime

    class Config:
        orm_mode = True

class SyncLogResponse(BaseModel):
    """Schema for sync log response."""
    id: int
    project_id: str
    sync_time: datetime
    status: str
    message: Optional[str] = None
    forms_synced: int
    submissions_synced: int

    class Config:
        orm_mode = True