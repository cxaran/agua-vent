from fastapi import APIRouter, HTTPException, Response, status

from backend.auth.account_lock import unlock_user_by_token
from backend.auth.auth import authenticate, delete_session_cookie, set_session_cookie
from backend.auth.auth_dependencies import CurrentUser
from backend.auth.forgot_password import (
    reset_password as reset_user_password,
    send_password_reset_token,
)
from backend.auth.register import create_user, send_registration_token
from backend.core.database import SessionDep
from backend.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
)
from backend.schemas.user import UserBase, UserCreate


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=MessageResponse)
async def login(
    request: LoginRequest,
    response: Response,
    session: SessionDep,
) -> MessageResponse:
    token = await authenticate(session, request.email, request.password)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )

    set_session_cookie(response, token)

    return MessageResponse(message="Sesión iniciada")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response) -> MessageResponse:
    delete_session_cookie(response)

    return MessageResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserBase)
def get_me(current_user: CurrentUser) -> UserBase:
    return current_user


@router.post("/register/request", response_model=MessageResponse)
async def request_registration(
    request: RegisterRequest,
    session: SessionDep,
) -> MessageResponse:
    await send_registration_token(session, request.email)

    return MessageResponse(
        message="Si el correo no está registrado, recibirás un enlace de registro",
    )


@router.post(
    "/register",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    session: SessionDep,
) -> MessageResponse:
    user = create_user(session, user_data)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de registro inválido o expirado",
        )

    return MessageResponse(message="Usuario registrado exitosamente")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    session: SessionDep,
) -> MessageResponse:
    await send_password_reset_token(session, request.email)

    return MessageResponse(
        message="Si el correo está registrado, recibirás un enlace de recuperación",
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password_endpoint(
    request: ResetPasswordRequest,
    session: SessionDep,
) -> MessageResponse:
    user = reset_user_password(
        session,
        request.email,
        request.token,
        request.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de recuperación inválido o expirado",
        )

    return MessageResponse(message="Contraseña actualizada exitosamente")


@router.get("/unlock-account/{token}", response_model=MessageResponse)
def unlock_account(
    token: str,
    session: SessionDep,
) -> MessageResponse:
    user = unlock_user_by_token(session, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de desbloqueo inválido o expirado",
        )

    return MessageResponse(message="Cuenta desbloqueada exitosamente")
