from fastapi import Depends, HTTPException, status
from typing import Annotated
from app.models.userModel import User, UserRole
from app.api.v1.auth_routes import get_current_user

# isOrganizer middleware
async def require_organizer(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    if current_user.role != UserRole.ORGANIZER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only organizers can perform this action"
        )
    return current_user
