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
    delete_time_entry,
    can_edit_entry,
    get_total_hours,
    get_entry_by_date
)
from app.schemas.time_entry import TimeEntry, TimeEntryCreate, TimeEntryUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[TimeEntry])
def read_time_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        entries = get_time_entries(db, user_id=current_user.id)
        # Add can_edit flag to each entry
        for entry in entries:
            entry.can_edit = can_edit_entry(entry)
        return entries
    except Exception as e:
        print(f"Error in read_time_entries: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch time entries: {str(e)}"
        )

@router.post("/", response_model=TimeEntry)
def create_time_entry_endpoint(
    entry_data: TimeEntryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if entry already exists for this date
        existing_entry = get_entry_by_date(db, current_user.id, entry_data.date)
        if existing_entry:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A time entry already exists for {entry_data.date.strftime('%Y-%m-%d')}. Please edit the existing entry or choose a different date."
            )
        
        entry = create_time_entry(db, entry_data, user_id=current_user.id)
        entry.can_edit = can_edit_entry(entry)
        return entry
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in create_time_entry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create time entry: {str(e)}"
        )

@router.put("/{entry_id}", response_model=TimeEntry)
def update_time_entry_endpoint(
    entry_id: int,
    entry_data: TimeEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Check if another entry exists for the new date (excluding current entry)
        existing_entry = get_entry_by_date(db, current_user.id, entry_data.date)
        if existing_entry and existing_entry.id != entry_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Another time entry already exists for {entry_data.date.strftime('%Y-%m-%d')}. Please choose a different date."
            )
        
        entry = update_time_entry(db, entry_id, entry_data, user_id=current_user.id)
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Time entry not found or cannot be edited (48-hour limit exceeded)"
            )
        entry.can_edit = can_edit_entry(entry)
        return entry
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in update_time_entry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update time entry: {str(e)}"
        )

@router.delete("/{entry_id}")
def delete_time_entry_endpoint(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Get the entry first to check if it exists and user owns it
        entry = get_time_entry(db, entry_id, current_user.id)
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Time entry not found"
            )
        
        # Check if entry can be deleted (within 48 hours)
        if not can_edit_entry(entry):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Time entry cannot be deleted (48-hour limit exceeded)"
            )
        
        success = delete_time_entry(db, entry_id, current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Time entry not found"
            )
        
        return {"message": "Time entry deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in delete_time_entry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete time entry: {str(e)}"
        )

@router.get("/stats")
def get_time_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        total_hours = get_total_hours(db, user_id=current_user.id)
        remaining_hours = current_user.approved_hours - total_hours
        progress_percentage = (total_hours / current_user.approved_hours) * 100 if current_user.approved_hours > 0 else 0
        
        return {
            "total_hours": total_hours,
            "remaining_hours": remaining_hours,
            "approved_hours": current_user.approved_hours,
            "progress_percentage": round(progress_percentage, 1)
        }
    except Exception as e:
        print(f"Error in get_time_stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )
