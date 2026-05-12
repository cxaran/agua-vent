# app/core/redis.py

from redis import Redis

from backend.core.settings import settings

RedisText = str | bytes | bytearray | memoryview


def redis_text(value: RedisText) -> str:
    if isinstance(value, str):
        return value
    return bytes(value).decode("utf-8")


redis_client: Redis
"""Redis client:
Este cliente se conecta a Redis usando la configuración definida en app.core.settings.
Se recomienda usarlo para almacenar datos temporales.
"""
redis_client = Redis(
    host=settings.redis_host, port=settings.redis_port, db=settings.redis_db
)
