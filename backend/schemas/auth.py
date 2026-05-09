from pydantic import BaseModel, EmailStr, SecretStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: SecretStr


class RegisterRequest(BaseModel):
    email: EmailStr


class RegisterConfirm(BaseModel):
    name: str
    last_name: str
    email: EmailStr
    token: str
    password: SecretStr
    confirm_password: SecretStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    password: SecretStr
    confirm_password: SecretStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str


class AccessToken(BaseModel):
    access_token: str


class TokenPayload(BaseModel):
    sub: str
    exp: int
    iat: int
    jti: str


class UserInfo(BaseModel):
    id: str
    name: str
    last_name: str
    email: str
    permissions: list[str]
