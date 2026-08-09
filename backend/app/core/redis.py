import redis.asyncio as redis

from app.core.config import settings

redis_client: redis.Redis = redis.from_url(
    settings.redis_url, decode_responses=True, socket_connect_timeout=2
)


def click_channel(link_id: int) -> str:
    return f"clicks:{link_id}"


def user_click_channel(owner_id: int) -> str:
    return f"user:{owner_id}:clicks"
