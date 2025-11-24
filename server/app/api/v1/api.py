from fastapi import APIRouter
from . import auth_routes

api_router = APIRouter()
api_router.include_router(auth_routes.router)