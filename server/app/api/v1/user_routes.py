from fastapi import APIRouter, Depends
from typing import Annotated
from ...models.userModel import User
from ...schemas.user import UserOut
from .auth_routes import get_current_user

router = APIRouter(tags=["Users"])

@router.get("/me", response_model=UserOut)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
