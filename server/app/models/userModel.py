from sqlalchemy import Boolean, Column, DateTime, Integer, String, ForeignKey, func, Enum
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

class UserRole(str, enum.Enum):
    ORGANIZER = "organizer"
    USER = "user"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    organized_events = relationship("Event", back_populates="organizer", foreign_keys="Event.organizer_user_id")
    event_invitations = relationship("EventInvitee", back_populates="user")
