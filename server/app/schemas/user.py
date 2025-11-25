from pydantic import BaseModel
from datetime import datetime


class Users(BaseModel):
    username: str
    email: str

class UserOut(Users):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


