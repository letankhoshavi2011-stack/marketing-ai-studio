import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env into os.environ so google-genai and ADK can find API keys directly
load_dotenv()


class Settings(BaseSettings):
    google_api_key: str = ""
    google_cloud_project: str = ""
    google_cloud_location: str = "us-central1"
    database_url: str = "sqlite+aiosqlite:///./marketing.db"
    gemini_model: str = "gemini-3.1-pro-preview"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()

# Ensure these are in os.environ for google-genai / ADK SDK
if settings.google_api_key:
    os.environ.setdefault("GOOGLE_API_KEY", settings.google_api_key)
if settings.google_cloud_project:
    os.environ.setdefault("GOOGLE_CLOUD_PROJECT", settings.google_cloud_project)
if settings.google_cloud_location:
    os.environ.setdefault("GOOGLE_CLOUD_LOCATION", settings.google_cloud_location)
