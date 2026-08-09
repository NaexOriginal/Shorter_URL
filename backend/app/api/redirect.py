from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.click import Click
from app.models.link import Link

router = APIRouter()


@router.get("/{short_code}")
async def redirect_to_target(
    short_code: str, db: AsyncSession = Depends(get_db)
) -> RedirectResponse:
    link = await db.scalar(select(Link).where(Link.short_code == short_code))
    if link is None:
        raise HTTPException(status_code=404, detail="Link not found")

    db.add(Click(link_id=link.id))
    await db.execute(
        update(Link).where(Link.id == link.id).values(click_count=Link.click_count + 1)
    )
    await db.commit()

    return RedirectResponse(url=link.target_url, status_code=302)
