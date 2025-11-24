from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Index, func, text
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(Text, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    organizer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    event_starts_at = Column(DateTime, nullable=False)
    event_ends_at = Column(DateTime, nullable=False)

    # Relationships
    organizer = relationship("User", back_populates="organized_events", foreign_keys=[organizer_user_id])
    invitees = relationship("EventInvitee", back_populates="event", cascade="all, delete-orphan")

    # Full-text search index on title and description
    __table_args__ = (
        Index(
            'ix_events_fulltext',
            text("to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))"),
            postgresql_using='gin'
        ),
    )


# ROLE ENUM
class InviteeRole(str, enum.Enum):
    ATTENDEE = "attendee"
    COLLABORATOR = "collaborator"


# STATUS ENUM
class InviteeStatus(str, enum.Enum):
    GOING = "going"
    MAYBE = "maybe"
    NOT_GOING = "not_going"
    PENDING = "pending"


class EventInvitee(Base):
    __tablename__ = "events_invitees"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), primary_key=True, index=True)
    role = Column(Enum(InviteeRole), nullable=False, default=InviteeRole.ATTENDEE)
    status = Column(Enum(InviteeStatus), nullable=False, default=InviteeStatus.PENDING)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    status_last_changed_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="event_invitations")
    event = relationship("Event", back_populates="invitees")
