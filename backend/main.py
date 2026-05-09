
from fastapi import APIRouter, FastAPI
from backend.core.settings import settings

from backend.routes import auth_router


app = FastAPI(
    title=settings.project_name,
    openapi_url="/api/openapi.json",
)


app.include_router(
    APIRouter(
        routes=[
            *auth_router.routes,
        ]
    ),
    prefix="/api/v1",
)