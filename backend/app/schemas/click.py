from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ClickRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    clicked_at: datetime
    country: str | None
    city: str | None
    device_type: str | None
    browser: str | None
    os: str | None
