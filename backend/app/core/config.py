from __future__ import annotations

from functools import lru_cache

from pydantic import PostgresDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "SaaS Boilerplate"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # Database
    DATABASE_URL: PostgresDsn | str

    # JWT / Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Rate Limiting
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_REGISTER: str = "5/minute"

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_must_be_strong(cls, v: str) -> str:
        if len(v) < 32:
            msg = "SECRET_KEY must be at least 32 characters long"
            raise ValueError(msg)
        return v

    @model_validator(mode="after")
    def check_database_url(self) -> Settings:
        db_url = str(self.DATABASE_URL)
        if not db_url.startswith(("postgresql", "sqlite")):
            msg = "DATABASE_URL must be a PostgreSQL or SQLite URL"
            raise ValueError(msg)
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
