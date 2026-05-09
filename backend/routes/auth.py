from fastapi import APIRouter, HTTPException, Response, status

from backend.core.database import SessionDep
from backend.auth.auth_dependencies import CurrentUser
from backend.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    RegisterConfirm,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    MessageResponse,
    UserInfo,
)

from backend.auth import register as register_mod
from backend.auth import auth as auth_mod
from backend.auth import forgotpassword as forgot_mod
from backend.auth import locked as locked_mod

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    session: SessionDep,
    body: LoginRequest,
):
    access_token = await auth_mod.authenticate(session, body.email, body.password)
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales invalidas",
        )
    auth_mod.set_session_cookie(response, access_token)
    return TokenResponse(access_token=access_token)


@router.post("/register/request", response_model=MessageResponse)
async def register_request(
    session: SessionDep,
    body: RegisterRequest,
):
    token = await register_mod.generate_email_token(session, body.email)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya esta registrado o no es valido",
        )
    return MessageResponse(message="Token enviado al correo electronico")


@router.post("/register/confirm", response_model=MessageResponse)
def register_confirm(
    session: SessionDep,
    body: RegisterConfirm,
):
    from backend.schemas.user import UserCreate

    user_data = UserCreate(
        name=body.name,
        last_name=body.last_name,
        email=body.email,
        token=body.token,
        password=body.password,
        confirm_password=body.confirm_password,
    )
    user = register_mod.create_user(session, user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalido o expirado, o email no coincide",
        )
    return MessageResponse(message="Usuario registrado exitosamente")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(
    session: SessionDep,
    body: ForgotPasswordRequest,
):
    token = await forgot_mod.generate_email_token(session, body.email)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email no encontrado o cuenta inactiva",
        )
    return MessageResponse(message="Token de recuperacion enviado al correo electronico")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    session: SessionDep,
    body: ResetPasswordRequest,
):
    user = forgot_mod.reset_password(session, body.email, body.token, body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalido, expirado o email no coincide",
        )
    return MessageResponse(message="Contrasena restablecida exitosamente")


@router.get("/unlock-account/{token}", response_model=MessageResponse)
def unlock_account(
    session: SessionDep,
    token: str,
):
    user = locked_mod.validate_locked_token(session, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalido o expirado",
        )
    return MessageResponse(message="Cuenta desbloqueada exitosamente")


@router.post("/logout", response_model=MessageResponse)
def logout(response: Response):
    auth_mod.delete_session_cookie(response)
    return MessageResponse(message="Sesion cerrada exitosamente")


@router.get("/me", response_model=UserInfo)
def me(current_user: CurrentUser):
    return UserInfo(
        id=str(current_user.id),
        name=current_user.name,
        last_name=current_user.last_name,
        email=current_user.email,
        permissions=list(current_user.permissions),
    )
