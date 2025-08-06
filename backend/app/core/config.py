from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./wbso_tracker.db"
    
    SECRET_KEY: str = "your-secret-key-change-in-production-super-long-and-random"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60
    
    PROJECT_NAME: str = "WBSO Time Tracker"
    
    class Config:
        env_file = ".env"

settings = Settings()
