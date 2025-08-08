from sqlalchemy.orm import Session
from app.models.time_entry import TimeEntry
from app.schemas.time_entry import TimeEntryCreate, TimeEntryUpdate
from typing import List, Optional
from datetime import datetime, timedelta, timezone

def get_time_entries(db: Session, user_id: int) -> List[TimeEntry]:
    return db.query(TimeEntry).filter(TimeEntry.user_id == user_id).order_by(TimeEntry.date.desc()).all()

def get_time_entry(db: Session, entry_id: int, user_id: int) -> Optional[TimeEntry]:
    return db.query(TimeEntry).filter(TimeEntry.id == entry_id, TimeEntry.user_id == user_id).first()

def get_entry_by_date(db: Session, user_id: int, date: datetime) -> Optional[TimeEntry]:
    """Check if an entry already exists for the given date"""
    # Extract just the date part (ignore time)
    target_date = date.date()
    
    entries = db.query(TimeEntry).filter(TimeEntry.user_id == user_id).all()
    for entry in entries:
        if entry.date.date() == target_date:
            return entry
    return None

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

def delete_time_entry(db: Session, entry_id: int, user_id: int) -> bool:
    """Delete a time entry if it exists and belongs to the user"""
    db_entry = get_time_entry(db, entry_id, user_id)
    if not db_entry:
        return False
    
    # Check if entry can be deleted (within 48 hours)
    if not can_edit_entry(db_entry):
        return False
    
    db.delete(db_entry)
    db.commit()
    return True

def can_edit_entry(entry: TimeEntry) -> bool:
    """Check if entry can be edited (within 48 hours of creation)"""
    try:
        # Get current time with timezone
        now = datetime.now(timezone.utc)
        
        # Ensure entry.created_at has timezone info
        if entry.created_at.tzinfo is None:
            # If no timezone, assume UTC
            entry_time = entry.created_at.replace(tzinfo=timezone.utc)
        else:
            entry_time = entry.created_at
        
        time_limit = entry_time + timedelta(hours=48)
        return now < time_limit
    except Exception as e:
        print(f"Error in can_edit_entry: {e}")
        # If there's any error, default to not editable for safety
        return False

def get_total_hours(db: Session, user_id: int) -> float:
    """Get total hours logged by user"""
    result = db.query(TimeEntry).filter(TimeEntry.user_id == user_id).all()
    return sum(entry.hours for entry in result)
