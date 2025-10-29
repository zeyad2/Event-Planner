# app/routers/user_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Annotated
from app.db.session import SessionLocal
from app.models.userModel import User
from app.schemas.user import Users

router = APIRouter(prefix="/users", tags=["Users"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/signup", response_model=Users)
def create_user(user: Users, db: db_dependency):
    db_user = User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Users)
def login_user(user: Users, db: db_dependency):
    db_user = db.query(User).filter(
        User.username == user.username,
        User.email == user.email
    ).first()
    if db_user is None:
        return {"error": "Invalid username or email"}
    return db_user
