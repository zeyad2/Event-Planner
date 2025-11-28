from pydantic import BaseModel
from datetime import datetime
from app.models.userModel import UserRole


class Users(BaseModel):
    username: str
    email: str
    role: UserRole

class UserOut(Users):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


