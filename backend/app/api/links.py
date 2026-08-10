from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.db import get_db
from app.core.short_code import generate_short_code
from app.models.click import Click
from app.models.link import Link
from app.models.user import User
from app.schemas.click import ClickRead
from app.schemas.link import LinkCreate, LinkRead

router = APIRouter(prefix="/api/links", tags=["links"])


async def _unique_short_code(db: AsyncSession) -> str:
    for _ in range(5):
        code = generate_short_code()
        exists = await db.scalar(select(Link.id).where(Link.short_code == code))
        if not exists:
            return code
    raise HTTPException(status_code=500, detail="Could not generate a unique short code")


async def _get_owned_link(short_code: str, db: AsyncSession, current_user: User) -> Link:
    link = await db.scalar(
        select(Link).where(Link.short_code == short_code, Link.owner_id == current_user.id)
    )
    if link is None:
        raise HTTPException(status_code=404, detail="Link not found")
    return link


@router.post("", response_model=LinkRead, status_code=201)
async def create_link(
    payload: LinkCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Link:
    if payload.custom_slug:
        taken = await db.scalar(select(Link.id).where(Link.short_code == payload.custom_slug))
        if taken:
            raise HTTPException(status_code=409, detail="That alias is already taken")
        short_code = payload.custom_slug
    else:
        short_code = await _unique_short_code(db)

    link = Link(short_code=short_code, target_url=payload.target_url, owner_id=current_user.id)
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


@router.get("", response_model=list[LinkRead])
async def list_links(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Link]:
    result = await db.scalars(
        select(Link)
        .where(Link.owner_id == current_user.id)
        .order_by(Link.created_at.desc())
    )
    return list(result.all())


@router.get("/{short_code}", response_model=LinkRead)
async def get_link(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Link:
    return await _get_owned_link(short_code, db, current_user)


@router.get("/{short_code}/clicks", response_model=list[ClickRead])
async def list_clicks(
    short_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Click]:
    link = await _get_owned_link(short_code, db, current_user)
    result = await db.scalars(
        select(Click).where(Click.link_id == link.id).order_by(Click.clicked_at.desc())
    )
    return list(result.all())
