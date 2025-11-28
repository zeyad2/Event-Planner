from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Annotated, List, Optional
from datetime import datetime
from ...db.session import SessionLocal
from ...models.eventModel import Event, EventInvitee
from ...models.userModel import User, UserRole
from ...schemas.event import EventCreate, EventUpdate, EventOut, InviteRequest, InviteResponse, StatusUpdate, AttendeeOut, EventListItem
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


@router.get("", status_code=status.HTTP_200_OK, response_model=List[EventListItem])
async def list_events(
    db: db_dependency,
    current_user: Annotated[User, Depends(get_current_user)],
    keyword: Optional[str] = Query(None, description="filter by title and description"),
    starts_at: Optional[datetime] = Query(None, description="filter events starting after this date"),
    ends_at: Optional[datetime] = Query(None, description="filter events ending before this date"),
    user_role: Optional[str] = Query(None, description="Filter by user role: 'organizzer' or 'user'"),
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0)
):
    
    if user_role == "organizer" and current_user.role != UserRole.ORGANIZER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="only users with organizer role can filter by userRole=organizer")
    
    query = db.query(
        Event.id,
        Event.title,
        Event.description,
        Event.event_starts_at,
        Event.event_ends_at,
        Event.organizer_user_id,
        Event.created_at,
        Event.updated_at,
        (Event.organizer_user_id == current_user.id).label('is_organizer'),
        EventInvitee.role.label('role'),
        EventInvitee.status.label('status'),
        EventInvitee.created_at.label('invited_at'),
        EventInvitee.status_last_changed_at.label('status_updated_at')
    ).outerjoin(EventInvitee, (EventInvitee.event_id == Event.id) & (EventInvitee.user_id == current_user.id)
    ).filter(or_(Event.organizer_user_id == current_user.id, EventInvitee.user_id == current_user.id))



    if keyword:
        query = query.filter(or_(Event.title.ilike(f"%{keyword}%"), Event.description.ilike(f"%{keyword}%")))
    
    # if organizer only filter by organizer
    if user_role == "organizer":
        query = query.filter(Event.organizer_user_id == current_user.id)
    # if user only filter by invited
    elif user_role == "user":
        query = query.filter(EventInvitee.user_id == current_user.id)
    
    if starts_at:
        query = query.filter(Event.event_starts_at>= starts_at)
    if ends_at:
        query= query.filter(Event.event_ends_at <= ends_at)
    
    query = query.order_by(Event.event_starts_at.asc())
    
    query = query.offset(skip).limit(limit)

    results = query.all()
    print("Query Results: ", results)
    return results


@router.get("/{event_id}", status_code=status.HTTP_200_OK, response_model=EventOut)
async def get_event(
    event_id: int,
    db: db_dependency,
    current_user: Annotated[User, Depends(get_current_user)]
):
    event = db.query(Event).filter(Event.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )

    # Check if user has access to this event (organizer or invited)
    is_organizer = event.organizer_user_id == current_user.id
    invitation = db.query(EventInvitee).filter(
        EventInvitee.event_id == event_id,
        EventInvitee.user_id == current_user.id
    ).first()

    if not is_organizer and not invitation:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this event"
        )

    return event


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


@router.post("/{event_id}/attendees/invite", status_code=status.HTTP_207_MULTI_STATUS, response_model=InviteResponse)
async def invite_users_to_event(
    event_id: int,
    invite_data: InviteRequest,
    db: db_dependency,
    current_user: organizer_dependency
):
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"event with given with id {event_id} not found")
    
    if event.organizer_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, 
        detail="only the event organizer can invite users")
    
    invited_emails = []
    failed_emails = []
    
    for email in invite_data.emails:
        try:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                failed_emails.append({"email": email, "reason": "user not found"})
                continue
            
            if user.id == current_user.id:
                failed_emails.append({"email": email,"reason": "cannot invite yourself"})
                continue
            
            existing_invite = db.query(EventInvitee).filter(
                EventInvitee.event_id == event_id,
                EventInvitee.user_id == user.id
            ).first()
            
            if existing_invite:
                failed_emails.append({"email": email, "reason": "already invited"})
                continue
            
            new_invite = EventInvitee(event_id=event_id, user_id=user.id)
            
            db.add(new_invite)
            db.commit()
            invited_emails.append(email)
            
        except Exception as e:
            db.rollback()
            failed_emails.append({"email": email, "reason": f"error: {str(e)}"})
    
    return InviteResponse(invited_emails=invited_emails, failed_emails=failed_emails)


@router.patch("/{event_id}/attendees/status", status_code=status.HTTP_200_OK)
async def update_attendance_status(
    event_id: int,
    status_update: StatusUpdate,
    db: db_dependency,
    current_user: Annotated[User, Depends(get_current_user)]
):
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"event with id {event_id} not found")
    
    invitation = db.query(EventInvitee).filter(
        EventInvitee.event_id == event_id,
        EventInvitee.user_id == current_user.id
    ).first()
    
    print(current_user.id)
    print(event.id)
    if not invitation:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,detail="user is not invited")
    
    current_time = datetime.utcnow()
    if event.event_ends_at <= current_time:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="cannot update status for an event that has already ended")
    
    invitation.status = status_update.status
    
    db.commit()
    db.refresh(invitation)
    
    return {"status": invitation.status.value}


@router.get("/{event_id}/attendees", status_code=status.HTTP_200_OK, response_model=List[AttendeeOut])
async def list_event_attendees(
    event_id: int,
    db: db_dependency,
    current_user: organizer_dependency
):
    event = db.query(Event).filter(Event.id == event_id).first()
    
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"event with id {event_id} not found")
    
    if event.organizer_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="permession not allowed, user is not the organizer")
    
    invitees = db.query(EventInvitee).filter(EventInvitee.event_id == event_id).all()
    
    attendees = []
    for invitee in invitees:
        attendees.append(AttendeeOut(
            user=invitee.user,
            role=invitee.role,
            status=invitee.status,
            invited_at=invitee.created_at,
            status_updated_at=invitee.status_last_changed_at
        ))
    
    return attendees
