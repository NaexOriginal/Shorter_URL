from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Shorter URL API"
    environment: str = "development"
    cors_origins: list[str] = ["http://localhost:5173"]

    database_url: str = "postgresql+asyncpg://shorter:shorter@localhost:5432/shorter_url"
    redis_url: str = "redis://localhost:6379/0"

    jwt_secret_key: str = "dev-secret-change-me-this-is-not-secure-32b"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24

    # Path to a MaxMind GeoLite2-City.mmdb file. Optional: if missing, geo
    # fields are simply left null (see README for how to obtain one).
    geoip_db_path: str = "geoip/GeoLite2-City.mmdb"


settings = Settings()
