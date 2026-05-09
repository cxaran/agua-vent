# app/core/redis.py

from redis import Redis

from backend.core.settings import settings

redis_client: Redis
"""Redis client:
Este cliente se conecta a Redis usando la configuración definida en app.core.settings.
Se recomienda usarlo para almacenar datos temporales.
"""
redis_client = Redis(
    host=settings.redis_host, port=settings.redis_port, db=settings.redis_db
)
