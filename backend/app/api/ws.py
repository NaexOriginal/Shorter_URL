from fastapi import APIRouter, Depends, WebSocket, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.redis import click_channel, redis_client, user_click_channel
from app.core.security import decode_access_token
from app.models.link import Link
from app.models.user import User

router = APIRouter()


async def _authenticated_user(websocket: WebSocket, db: AsyncSession) -> User | None:
    """Auth uses a `?token=` query param (not the Authorization header) since
    browsers' native WebSocket API can't set custom headers on the handshake."""
    token = websocket.query_params.get("token")
    email = decode_access_token(token) if token else None
    if email is None:
        return None
    return await db.scalar(select(User).where(User.email == email))


async def _stream_channel(websocket: WebSocket, channel: str) -> None:
    await websocket.accept()
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


@router.websocket("/ws/links/{short_code}")
async def stream_link_clicks(
    websocket: WebSocket, short_code: str, db: AsyncSession = Depends(get_db)
) -> None:
    """Push each new click on this link to its owner in real time."""
    user = await _authenticated_user(websocket, db)
    link = (
        await db.scalar(
            select(Link).where(Link.short_code == short_code, Link.owner_id == user.id)
        )
        if user
        else None
    )
    if link is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await _stream_channel(websocket, click_channel(link.id))


@router.websocket("/ws/me")
async def stream_my_clicks(websocket: WebSocket, db: AsyncSession = Depends(get_db)) -> None:
    """Push every new click across all of the current user's links, for the
    dashboard overview's live activity feed."""
    user = await _authenticated_user(websocket, db)
    if user is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await _stream_channel(websocket, user_click_channel(user.id))
