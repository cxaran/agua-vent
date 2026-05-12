from .auth import router as auth_router
from .admin import router as admin_router

__all__ = ["admin_router", "auth_router"]
