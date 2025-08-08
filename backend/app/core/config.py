from pydantic_settings import BaseSettings
from typing import Optional
import secrets

class Settings(BaseSettings):
    # Database - will use environment variable if available, fallback to SQLite for local dev
    DATABASE_URL: str = "sqlite:///./wbso_tracker.db"
    
    # Security - generate secure defaults
    SECRET_KEY: str = secrets.token_urlsafe(64)  # Generate secure random key
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # Reduced from 30 days to 1 hour
    
    # App settings
    PROJECT_NAME: str = "WBSO Time Tracker"
    
    # Security settings
    BCRYPT_ROUNDS: int = 12  # More secure password hashing
    
    class Config:
        env_file = ".env"

settings = Settings()
