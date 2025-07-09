import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings."""
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Tathmini API"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list = ["*"]
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tathmini.db")
    
    # MongoDB settings for ODK data
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB: str = os.getenv("MONGODB_DB", "tathmini_odk")
    
    # Encryption settings
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")  # Must be set in .env for production
    
    class Config:
        case_sensitive = True

# Create global settings object
settings = Settings()