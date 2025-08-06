from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.crud.time_entry import (
    get_time_entries, 
    create_time_entry, 
    update_time_entry, 
    get_time_entry,
    can_edit_entry,
    get_total_hours
)
from app.schemas.time_entry import TimeEntry, TimeEntryCreate, TimeEntryUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[TimeEntry])
def read_time_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entries = get_time_entries(db, user_id=current_user.id)
    # Add can_edit flag to each entry
    for entry in entries:
        entry.can_edit = can_edit_entry(entry)
    return entries

@router.post("/", response_model=TimeEntry)
def create_time_entry_endpoint(
    entry_data: TimeEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = create_time_entry(db, entry_data, user_id=current_user.id)
    entry.can_edit = can_edit_entry(entry)
    return entry

@router.put("/{entry_id}", response_model=TimeEntry)
def update_time_entry_endpoint(
    entry_id: int,
    entry_data: TimeEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = update_time_entry(db, entry_id, entry_data, user_id=current_user.id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found or cannot be edited (48-hour limit exceeded)"
        )
    entry.can_edit = can_edit_entry(entry)
    return entry

@router.get("/stats")
def get_time_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_hours = get_total_hours(db, user_id=current_user.id)
    remaining_hours = current_user.approved_hours - total_hours
    progress_percentage = (total_hours / current_user.approved_hours) * 100 if current_user.approved_hours > 0 else 0
    
    return {
        "total_hours": total_hours,
        "remaining_hours": remaining_hours,
        "approved_hours": current_user.approved_hours,
        "progress_percentage": round(progress_percentage, 1)
    }
