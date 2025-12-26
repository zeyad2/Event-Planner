from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:123@localhost:5432/Events"
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    DEBUG: bool = False  # default if not in .env

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

# Create a single settings instance to import anywhere
settings = Settings()
print("DATABASE_URL", settings.DATABASE_URL)
if settings.DEBUG:
    print(f"Loading .env from: {ENV_FILE}")
    print(f"DATABASE_URL loaded: {'Yes' if settings.DATABASE_URL else 'No'}")
