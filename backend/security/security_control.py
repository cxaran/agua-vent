import uuid
from typing import Annotated, Any

from fastapi import Depends, HTTPException, status

from backend.auth.auth_dependencies import CurrentUser


WILDCARD_ACCESS = "*"


class SecurityControl:
    """Clase que representa un permiso del sistema con dominio."""

    def __init__(
        self,
        access: str,
        description: str | None = None,
    ):
        self.access = access
        self.description = description

    def __repr__(self) -> str:
        return f"SecurityControl({self.access})"

    def check(
        self,
        current_user: CurrentUser,
    ) -> bool:
        return current_user.access_control(self.access)

    def check_subscription(
        self,
        current_user: CurrentUser,
    ) -> bool:
        return current_user.subscription_access_control(self.access)

    def _requiere(
        self,
        current_user: CurrentUser,
    ) -> bool:
        if not self.check(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="No disponible"
            )
        return True

    def _subscription_id(
        self,
        current_user: CurrentUser,
    ) -> uuid.UUID:
        if current_user.subscription is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes una suscripción activa",
            )
        if not self.check_subscription(current_user):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No disponible",
            )
        return current_user.subscription.id

    @property
    def requiere(self) -> Any:
        return Annotated[bool, Depends(self._requiere)]

    @property
    def subscription_id(self) -> Any:
        return Annotated[uuid.UUID, Depends(self._subscription_id)]
    
