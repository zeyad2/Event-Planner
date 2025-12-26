from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.openapi.docs import get_swagger_ui_html
import os
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import Base, engine
from app.api.v1.api import api_router
from app.models import User, Event, EventInvitee  # Import all models
import traceback
import logging

# logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event Planner")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # Allows any domain
    allow_methods=["*"],           # Allows all verbs (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],           # Allows all headers
    allow_credentials=False,       # IMPORTANT: Must be False if origins is ["*"]
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "cors_configured": True}

# Include routers
app.include_router(api_router, prefix="/api")

# --- JSON swagger ---
@app.get("/api-design", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url="/api-design/openapi.json",
        title="Event Planner API - Design Spec"
    )

@app.get("/api-design/openapi.json", include_in_schema=False)
async def get_custom_openapi():
    file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "docs", "openapi.json")
    return FileResponse(file_path)


# global handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__}
    )
