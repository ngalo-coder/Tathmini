from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    """Base user schema with common attributes."""
    email: Optional[str] = None
    is_active: Optional[bool] = True
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """Schema for creating a new user."""
    email: str
    password: str

class UserUpdate(UserBase):
    """Schema for updating a user."""
    password: Optional[str] = None

class UserInDBBase(UserBase):
    """Schema for user stored in DB."""
    id: int
    
    class Config:
        orm_mode = True

class User(UserInDBBase):
    """Schema for user response."""
    pass

class UserInDB(UserInDBBase):
    """Schema for user with hashed password."""
    hashed_password: str