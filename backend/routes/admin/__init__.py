from fastapi import APIRouter

from .roles import router as roles_router
from .subscription import router as subscription_router
from .users import router as users_router


router = APIRouter(prefix="/admin")
router.include_router(roles_router)
router.include_router(subscription_router)
router.include_router(users_router)

__all__ = ["router"]
