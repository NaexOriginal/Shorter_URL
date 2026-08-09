from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.geoip import lookup_ip
from app.core.user_agent import parse_user_agent
from app.models.click import Click
from app.models.link import Link

router = APIRouter()


def _client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else None


@router.get("/{short_code}")
async def redirect_to_target(
    short_code: str, request: Request, db: AsyncSession = Depends(get_db)
) -> RedirectResponse:
    link = await db.scalar(select(Link).where(Link.short_code == short_code))
    if link is None:
        raise HTTPException(status_code=404, detail="Link not found")

    client_ip = _client_ip(request)
    country, city = lookup_ip(client_ip) if client_ip else (None, None)
    device_type, browser, os_name = parse_user_agent(request.headers.get("user-agent"))

    db.add(
        Click(
            link_id=link.id,
            ip_address=client_ip,
            country=country,
            city=city,
            device_type=device_type,
            browser=browser,
            os=os_name,
        )
    )
    await db.execute(
        update(Link).where(Link.id == link.id).values(click_count=Link.click_count + 1)
    )
    await db.commit()

    return RedirectResponse(url=link.target_url, status_code=302)
