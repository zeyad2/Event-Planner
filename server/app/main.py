# app/main.py
from fastapi import FastAPI
from app.db.session import Base, engine
from app.api.v1.api import api_router

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event Planner")

# Include routers
app.include_router(api_router, prefix="/api")