from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HRMS Lite API"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./hrms_lite.db"
    cors_origins: str = "*"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()

if settings.database_url.startswith("postgres://"):
    settings.database_url = settings.database_url.replace("postgres://", "postgresql+psycopg://", 1)
elif settings.database_url.startswith("postgresql://") and "+psycopg" not in settings.database_url:
    settings.database_url = settings.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
