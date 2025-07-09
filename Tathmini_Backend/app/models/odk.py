from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base

class ODKCredentials(Base):
    """Model for storing encrypted ODK Central credentials."""
    __tablename__ = "odk_credentials"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, unique=True, index=True)
    encrypted_credentials = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class ODKSyncStatus(Base):
    """Model for tracking ODK sync status."""
    __tablename__ = "odk_sync_status"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("odk_credentials.project_id", ondelete="CASCADE"), unique=True)
    status = Column(String, default="idle")  # 'idle', 'syncing', 'paused'
    last_sync_time = Column(DateTime, nullable=True)
    next_sync_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with ODKCredentials
    credentials = relationship("ODKCredentials", backref="sync_status")

class ODKSyncLog(Base):
    """Model for logging ODK sync operations."""
    __tablename__ = "odk_sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("odk_credentials.project_id", ondelete="CASCADE"))
    sync_time = Column(DateTime, default=datetime.utcnow)
    status = Column(String)  # 'success', 'failed'
    message = Column(String, nullable=True)
    forms_synced = Column(Integer, default=0)
    submissions_synced = Column(Integer, default=0)
    
    # Relationship with ODKCredentials
    credentials = relationship("ODKCredentials", backref="sync_logs")