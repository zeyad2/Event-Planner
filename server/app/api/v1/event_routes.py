from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated
from ...db.session import SessionLocal
from ...models.eventModel import Event
from ...models.userModel import User
from ...schemas.event import EventCreate, EventUpdate, EventOut
from .dependencies import require_organizer
from .auth_routes import get_current_user


router = APIRouter(prefix="/events", tags=["Events"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
organizer_dependency = Annotated[User, Depends(require_organizer)]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=EventOut)
async def create_event(
    event_data: EventCreate,
    db: db_dependency,
    current_user: organizer_dependency
):
    if event_data.event_ends_at <= event_data.event_starts_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="event end time must be after start time"
        )

    if db.query(Event).filter(Event.title ==event_data.title).first():
        raise HTTPException(detail="an event with name already exists", status_code=status.HTTP_409_CONFLICT)


    
    new_event = Event(
        title=event_data.title,
        description=event_data.description,
        event_starts_at=event_data.event_starts_at,
        event_ends_at=event_data.event_ends_at,
        organizer_user_id=current_user.id
    )
    
    db.add(new_event)

    db.commit()
    db.refresh(new_event)
    
    return new_event


@router.put("/{event_id}", response_model=EventOut)
async def update_event(
    event_id: int,
    event_data: EventUpdate,
    db: db_dependency,
    current_user: organizer_dependency
):
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    if event.organizer_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update events that you organized"
        )
    

    if db.query(Event).filter(Event.title == event_data.title, Event.id != event.id).first():
        raise HTTPException(detail="an event with this name already exists", status_code=status.HTTP_409_CONFLICT)

    # update what is provided only
    update_data = event_data.model_dump(exclude_unset=True)

    if "event_starts_at" in update_data or "event_ends_at" in update_data:
        start_time = update_data.get("event_starts_at", event.event_starts_at)
        end_time = update_data.get("event_ends_at", event.event_ends_at)
        
        if end_time <= start_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event end time must be after start time"
            )
    
    for field, value in update_data.items():
        setattr(event, field, value)
    
    db.commit()
    db.refresh(event)
    
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    db: db_dependency,
    current_user: organizer_dependency
):
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Event with id {event_id} not found")
    
    if event.organizer_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete events that you organized")
    
    db.delete(event)
    db.commit()
    
    # 204
    return None
