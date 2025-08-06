from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TimeEntryBase(BaseModel):
    date: datetime
    hours: float
    project_phase: str
    activity_description: str
    technical_challenge: str

class TimeEntryCreate(TimeEntryBase):
    pass

class TimeEntryUpdate(TimeEntryBase):
    pass

class TimeEntry(TimeEntryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    can_edit: bool = False  # Will be calculated based on creation time

    class Config:
        from_attributes = True
