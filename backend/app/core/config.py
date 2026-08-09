from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Shorter URL API"
    environment: str = "development"
    cors_origins: list[str] = ["http://localhost:5173"]

    database_url: str = "postgresql+asyncpg://shorter:shorter@localhost:5432/shorter_url"
    redis_url: str = "redis://localhost:6379/0"


settings = Settings()
