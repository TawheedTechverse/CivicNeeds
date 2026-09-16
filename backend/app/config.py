import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg2://civicneeds:civicneeds@localhost:5432/civicneeds"
    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    cors_origins: str = "http://localhost:5173"
    cors_origin_regex: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sqlalchemy_database_url(self) -> str:
        # Managed Postgres providers (Render, Heroku, etc.) hand out bare
        # "postgresql://" URLs; SQLAlchemy needs the psycopg2 driver suffix.
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Gemini reads its key directly from the environment, per the SDK's convention.
os.environ.setdefault("GEMINI_API_KEY", get_settings().gemini_api_key)
