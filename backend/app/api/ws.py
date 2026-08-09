from fastapi import APIRouter, Depends, WebSocket, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.redis import click_channel, redis_client
from app.core.security import decode_access_token
from app.models.link import Link
from app.models.user import User

router = APIRouter()


async def _authorized_link(
    websocket: WebSocket, short_code: str, db: AsyncSession
) -> Link | None:
    token = websocket.query_params.get("token")
    email = decode_access_token(token) if token else None
    if email is None:
        return None

    user = await db.scalar(select(User).where(User.email == email))
    if user is None:
        return None

    return await db.scalar(
        select(Link).where(Link.short_code == short_code, Link.owner_id == user.id)
    )


@router.websocket("/ws/links/{short_code}")
async def stream_link_clicks(
    websocket: WebSocket, short_code: str, db: AsyncSession = Depends(get_db)
) -> None:
    """Push each new click on this link to its owner in real time.

    Auth uses a `?token=` query param (not the Authorization header) since
    browsers' native WebSocket API can't set custom headers on the handshake.
    """
    link = await _authorized_link(websocket, short_code, db)
    if link is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    channel = click_channel(link.id)
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(channel)
    try:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            await websocket.send_text(message["data"])
    except Exception:
        pass
    finally:
        await pubsub.unsubscribe(channel)
        await pubsub.close()
