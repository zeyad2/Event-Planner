"""Tiny shim to expose the FastAPI `app` at the package/module level.

This allows running `uvicorn main:app` when the working directory
is the `server/` folder. It simply imports `app` from the package
`app.main` (the real application) and re-exports it.
"""
from app.main import app  # re-export the FastAPI application using absolute import

__all__ = ["app"]
