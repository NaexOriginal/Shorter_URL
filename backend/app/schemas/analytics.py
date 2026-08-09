from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DailyClicksPoint(BaseModel):
    date: str
    count: int


class TopLinkStat(BaseModel):
    short_code: str
    target_url: str
    clicks: int


class TopCountryStat(BaseModel):
    country: str
    clicks: int


class RecentClickItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    short_code: str
    clicked_at: datetime
    country: str | None
    city: str | None
    device_type: str | None
    browser: str | None
    os: str | None


class AnalyticsOverview(BaseModel):
    clicks_by_day: list[DailyClicksPoint]
    top_link: TopLinkStat | None
    top_country: TopCountryStat | None
    recent_clicks: list[RecentClickItem]
