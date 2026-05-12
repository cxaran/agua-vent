from fastapi import APIRouter, FastAPI

from backend.core.settings import settings
from backend.routes import admin_router, auth_router

app = FastAPI(
    title=settings.project_name,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.include_router(
    APIRouter(
        routes=[
            *auth_router.routes,
            *admin_router.routes,
        ],
    ),
    prefix="/api/v1",
)
