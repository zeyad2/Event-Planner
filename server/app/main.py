from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.db.session import Base, engine
from app.api.v1.api import api_router
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Event Planner")

# Add exception handler for better error visibility
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception handler caught: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__}
    )

# Include routers
app.include_router(api_router, prefix="/api")