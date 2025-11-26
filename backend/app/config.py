"""Application configuration"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    # Database
    DATABASE_URL: str = "postgresql://devops:devops123@postgres:5432/devops_maturity"

    # JWT Authentication
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://192.168.44.93:5173",
        "http://192.168.44.93:8000",
        "http://devdocker.cinf.net:8673",
        "https://devdocker.cinf.net:8673",
        "http://10.224.139.62:8673",
        "http://10.224.139.61:8673",
        "http://lnxvthfth001:8673",
        "http://lnxvthfth002:8673",
    ]

    # Application
    PROJECT_NAME: str = "DevOps Maturity Assessment"
    VERSION: str = "1.0.0"
    DEBUG: bool = True

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
