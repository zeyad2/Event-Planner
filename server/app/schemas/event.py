from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.eventModel import InviteeStatus, InviteeRole


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


class InviteRequest(BaseModel):
    emails: List[str] = Field(..., min_length=1, max_length=10)


class InviteResponse(BaseModel):
    invited_emails: List[str]
    failed_emails: List[dict] = []


class StatusUpdate(BaseModel):
    status: InviteeStatus


class AttendeeUser(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class AttendeeOut(BaseModel):
    user: AttendeeUser
    role: InviteeRole
    status: InviteeStatus
    invited_at: datetime
    status_updated_at: datetime

    class Config:
        from_attributes = True


class EventListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    event_starts_at: datetime
    event_ends_at: datetime
    organizer_user_id: int
    created_at: datetime
    updated_at: datetime
    is_organizer: bool
    role: Optional[InviteeRole] = None
    status: Optional[InviteeStatus] = None
    invited_at: Optional[datetime] = None
    status_updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
