from fastapi import APIRouter
from . import auth_routes
from . import user_routes
from . import event_routes

api_router = APIRouter()
api_router.include_router(auth_routes.router)
api_router.include_router(user_routes.router)
api_router.include_router(event_routes.router)
