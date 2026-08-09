from datetime import datetime
from urllib.parse import urlparse

from pydantic import BaseModel, ConfigDict, field_validator


class LinkCreate(BaseModel):
    target_url: str

    @field_validator("target_url")
    @classmethod
    def validate_target_url(cls, value: str) -> str:
        parsed = urlparse(value)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            raise ValueError("target_url must be a valid http(s) URL")
        return value


class LinkRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    short_code: str
    target_url: str
    click_count: int
    created_at: datetime
