"""Application configuration

SECRET_KEY and DATABASE_URL have no defaults on purpose: the app must
refuse to start when they are unset rather than silently run with a
publicly-known credential. Dev values live in docker-compose.yml / .env
(see .env.example).
"""

from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    # Database (required — no default)
    DATABASE_URL: str

    # JWT Authentication (required — no default)
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS — comma-separated list or JSON array in the env var.
    # Only needed when the browser talks to the backend cross-origin;
    # the default covers local dev servers.
    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:8673",
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # Application
    PROJECT_NAME: str = "DevOps Maturity Assessment"
    VERSION: str = "2.1.0"
    DEBUG: bool = False

    # Dev conveniences — both must be true for the seed script to create
    # the well-known admin login.
    CREATE_DEV_USERS: bool = False

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def split_origins(cls, v):
        if isinstance(v, str) and not v.strip().startswith("["):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # "json" for production, "console" for dev

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
