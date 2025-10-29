# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool = False  # default if not in .env

    class Config:
        env_file = ".env"   # path to your .env file
        env_file_encoding = "utf-8"

# Create a single settings instance to import anywhere
settings = Settings()
