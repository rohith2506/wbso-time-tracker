from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Project information
    project_name = Column(String, nullable=False)
    wbso_application_number = Column(String, nullable=False)
    project_start_date = Column(DateTime, nullable=False)
    project_end_date = Column(DateTime, nullable=False)
    approved_hours = Column(Float, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    time_entries = relationship("TimeEntry", back_populates="user")
