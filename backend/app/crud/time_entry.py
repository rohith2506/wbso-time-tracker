from sqlalchemy.orm import Session
from app.models.time_entry import TimeEntry
from app.schemas.time_entry import TimeEntryCreate, TimeEntryUpdate
from typing import List, Optional
from datetime import datetime, timedelta

def get_time_entries(db: Session, user_id: int) -> List[TimeEntry]:
    return db.query(TimeEntry).filter(TimeEntry.user_id == user_id).order_by(TimeEntry.date.desc()).all()

def get_time_entry(db: Session, entry_id: int, user_id: int) -> Optional[TimeEntry]:
    return db.query(TimeEntry).filter(TimeEntry.id == entry_id, TimeEntry.user_id == user_id).first()

def create_time_entry(db: Session, entry: TimeEntryCreate, user_id: int) -> TimeEntry:
    db_entry = TimeEntry(**entry.dict(), user_id=user_id)
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

def update_time_entry(db: Session, entry_id: int, entry: TimeEntryUpdate, user_id: int) -> Optional[TimeEntry]:
    db_entry = get_time_entry(db, entry_id, user_id)
    if not db_entry:
        return None
    
    # Check if entry can be edited (within 48 hours)
    if not can_edit_entry(db_entry):
        return None
    
    for field, value in entry.dict().items():
        setattr(db_entry, field, value)
    
    db.commit()
    db.refresh(db_entry)
    return db_entry

def can_edit_entry(entry: TimeEntry) -> bool:
    """Check if entry can be edited (within 48 hours of creation)"""
    time_limit = entry.created_at + timedelta(hours=48)
    return datetime.utcnow() < time_limit

def get_total_hours(db: Session, user_id: int) -> float:
    """Get total hours logged by user"""
    result = db.query(TimeEntry).filter(TimeEntry.user_id == user_id).all()
    return sum(entry.hours for entry in result)
