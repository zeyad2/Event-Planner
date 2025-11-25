# app/routers/user_routes.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import Annotated, Optional, cast
from ...db.session import SessionLocal
from ...models.userModel import User
from ...schemas.user import Users, UserOut
from starlette import status
import bcrypt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from ...config.config import Settings, settings



router = APIRouter(prefix="/auth", tags=["Users"])


SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_DAYS = settings.ACCESS_TOKEN_EXPIRE_DAYS

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/auth/login")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    pwd_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Users

class CreateUserRequest(BaseModel):
    username: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email_or_username: str
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
@router.post("/signup", status_code=status.HTTP_201_CREATED, response_model=Users)
async def create_user(db: db_dependency, create_user_request: CreateUserRequest):
    create_user_model = User(
        username=create_user_request.username,
        email=create_user_request.email,
        hashed_password=hash_password(create_user_request.password)
    )
    db.add(create_user_model)
    try:
        db.commit()
        db.refresh(create_user_model)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already exists"
        )
 
    return create_user_model
    



@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: db_dependency):
   # OAuth2PasswordRequestForm uses username field, but we support email or username
   user = authenticate_user(form_data.username, form_data.password, db)
   if not user:
       raise HTTPException(
           status_code=status.HTTP_401_UNAUTHORIZED,
           detail="Incorrect email/username or password",
           headers={"WWW-Authenticate": "Bearer"},
       )

   token = create_access_token(str(user.username), cast(int, user.id), timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS))
   return {"access_token": token, "token_type": "bearer"}







def authenticate_user(email_or_username: str, password: str, db: Session) -> Optional[User]:
    # Try to find user by email or username
    user = db.query(User).filter(
        (User.email == email_or_username) | (User.username == email_or_username)
    ).first()
    if not user:
        return None
    if not verify_password(password, str(user.hashed_password)):
        return None
    return user

def create_access_token(username: str, user_id: int, expires_delta: timedelta ):
    encode = {"sub": username, "id": user_id}
    expires = datetime.utcnow() + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


@router.post("/login", response_model=LoginResponse)
async def login_user(login_data: LoginRequest, db: db_dependency):
    user = authenticate_user(login_data.email_or_username, login_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(str(user.username), cast(int, user.id), timedelta(days=settings.ACCESS_TOKEN_EXPIRE_DAYS))
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": Users(username=str(user.username), email=str(user.email))
    }

# isAuthenticated middleware: authenticate token, extract user id and username from token
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)], db: db_dependency):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        print(username)
        print(user_id)
        if username is None or user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

