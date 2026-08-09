from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models.click import Click
from app.models.link import Link
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsOverview,
    DailyClicksPoint,
    RecentClickItem,
    TopCountryStat,
    TopLinkStat,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

OVERVIEW_WINDOW_DAYS = 30
RECENT_CLICKS_LIMIT = 10


@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyticsOverview:
    since = datetime.now(UTC) - timedelta(days=OVERVIEW_WINDOW_DAYS)
    owned_in_window = (
        Link.owner_id == current_user.id,
        Click.link_id == Link.id,
        Click.clicked_at >= since,
    )

    day_column = func.date(Click.clicked_at)
    daily_rows = await db.execute(
        select(day_column.label("day"), func.count().label("count"))
        .join(Link, Click.link_id == Link.id)
        .where(*owned_in_window)
        .group_by(day_column)
        .order_by(day_column)
    )
    clicks_by_day = [
        DailyClicksPoint(date=str(row.day), count=row.count) for row in daily_rows
    ]

    top_link_row = (
        await db.execute(
            select(Click.link_id, func.count().label("count"))
            .join(Link, Click.link_id == Link.id)
            .where(*owned_in_window)
            .group_by(Click.link_id)
            .order_by(func.count().desc())
            .limit(1)
        )
    ).first()
    top_link = None
    if top_link_row is not None:
        link = await db.get(Link, top_link_row.link_id)
        if link is not None:
            top_link = TopLinkStat(
                short_code=link.short_code, target_url=link.target_url, clicks=top_link_row.count
            )

    top_country_row = (
        await db.execute(
            select(Click.country, func.count().label("count"))
            .join(Link, Click.link_id == Link.id)
            .where(*owned_in_window, Click.country.is_not(None))
            .group_by(Click.country)
            .order_by(func.count().desc())
            .limit(1)
        )
    ).first()
    top_country = (
        TopCountryStat(country=top_country_row.country, clicks=top_country_row.count)
        if top_country_row is not None
        else None
    )

    recent_rows = await db.execute(
        select(Click, Link.short_code)
        .join(Link, Click.link_id == Link.id)
        .where(Link.owner_id == current_user.id)
        .order_by(Click.clicked_at.desc())
        .limit(RECENT_CLICKS_LIMIT)
    )
    recent_clicks = [
        RecentClickItem(
            id=click.id,
            short_code=short_code,
            clicked_at=click.clicked_at,
            country=click.country,
            city=click.city,
            device_type=click.device_type,
            browser=click.browser,
            os=click.os,
        )
        for click, short_code in recent_rows
    ]

    return AnalyticsOverview(
        clicks_by_day=clicks_by_day,
        top_link=top_link,
        top_country=top_country,
        recent_clicks=recent_clicks,
    )
