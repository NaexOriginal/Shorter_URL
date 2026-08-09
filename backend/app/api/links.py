from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.short_code import generate_short_code
from app.models.link import Link
from app.schemas.link import LinkCreate, LinkRead

router = APIRouter(prefix="/api/links", tags=["links"])


async def _unique_short_code(db: AsyncSession) -> str:
    for _ in range(5):
        code = generate_short_code()
        exists = await db.scalar(select(Link.id).where(Link.short_code == code))
        if not exists:
            return code
    raise HTTPException(status_code=500, detail="Could not generate a unique short code")


@router.post("", response_model=LinkRead, status_code=201)
async def create_link(payload: LinkCreate, db: AsyncSession = Depends(get_db)) -> Link:
    link = Link(short_code=await _unique_short_code(db), target_url=payload.target_url)
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


@router.get("", response_model=list[LinkRead])
async def list_links(db: AsyncSession = Depends(get_db)) -> list[Link]:
    result = await db.scalars(select(Link).order_by(Link.created_at.desc()))
    return list(result.all())


@router.get("/{short_code}", response_model=LinkRead)
async def get_link(short_code: str, db: AsyncSession = Depends(get_db)) -> Link:
    link = await db.scalar(select(Link).where(Link.short_code == short_code))
    if link is None:
        raise HTTPException(status_code=404, detail="Link not found")
    return link
