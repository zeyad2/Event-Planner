from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class EventBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    event_starts_at: datetime
    event_ends_at: datetime


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    event_starts_at: Optional[datetime] = None
    event_ends_at: Optional[datetime] = None


class EventOut(EventBase):
    id: int
    organizer_user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
