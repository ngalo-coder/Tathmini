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
    
    class Config:
        case_sensitive = True

# Create global settings object
settings = Settings()