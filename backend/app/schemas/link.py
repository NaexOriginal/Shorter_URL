import re
from datetime import datetime
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, field_validator

CUSTOM_SLUG_PATTERN = re.compile(r"^[a-zA-Z0-9_-]{3,32}$")
RESERVED_SLUGS = {"api", "docs", "redoc", "openapi.json", "health", "ws", "favicon.ico"}


class LinkCreate(BaseModel):
    target_url: str
    custom_slug: str | None = None

    @field_validator("target_url")
    @classmethod
    def validate_target_url(cls, value: str) -> str:
        parsed = urlparse(value)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError("target_url must be a valid http(s) URL")
        return value

    @field_validator("custom_slug")
    @classmethod
    def validate_custom_slug(cls, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        if not CUSTOM_SLUG_PATTERN.match(value):
            raise ValueError(
                "custom_slug must be 3-32 characters: letters, numbers, hyphens, underscores"
            )
        if value.lower() in RESERVED_SLUGS:
            raise ValueError("custom_slug is reserved")
        return value


class LinkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    short_code: str
    target_url: str
    click_count: int
    created_at: datetime
