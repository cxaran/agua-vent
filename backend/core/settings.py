# app/core/settings.py

from functools import lru_cache
from pathlib import Path

from pydantic import EmailStr, SecretStr, computed_field, PostgresDsn
from pydantic_core import MultiHostUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi_mail import ConnectionConfig


class Settings(BaseSettings):
    """
    Clase de configuración principal para la aplicación.

    Contiene:
    - Información general del proyecto
    - Parámetros de seguridad
    - Credenciales de Redis y PostgreSQL
    - Configuración de correo electrónico
    - Propiedades derivadas útiles (database_uri, mail_config)

    Las variables se pueden cargar automáticamente desde un archivo `.env`.
    """

    # --------------------
    # Información general del proyecto
    # --------------------
    project_name: str = "Agua Vent"
    """Nombre del proyecto (usado en logs, títulos y referencias internas)."""

    stack_name: str = "backend"
    """Nombre del stack/backend (puede diferenciar entre frontend/backend)."""

    domain: str = "localhost"
    """Dominio principal del proyecto (ej. localhost, example.com)."""

    # --------------------
    # Seguridad
    # --------------------
    algorithm: str = "HS256"
    """Algoritmo de cifrado para tokens JWT."""

    secret_key: SecretStr
    """Clave secreta para firmar y verificar tokens JWT."""

    access_token_expire: int = 24
    """Duración en horas de los tokens de acceso."""

    email_token_expire: int = 48
    """Duración en horas de los tokens enviados por email."""

    trys_login: int = 3
    """Número máximo de intentos fallidos de login antes de bloquear la cuenta."""

    domain_auth_url: str = "http://localhost:3000"
    """URL base del frontend para construir enlaces de verificación."""

    # --------------------
    # Super Usuario Inicial
    # --------------------
    superuser_email: str = "super@example.com"
    """Correo electrónico del superusuario."""

    superuser_name: str = "Superusuario"
    """Nombre del superusuario."""

    superuser_last_name: str = "Usuario"
    """Apellido del superusuario."""

    superuser_role: str = "superuser"
    """Nombre del rol del superusuario."""

    superuser_password: str = "superpassword"
    """Contraseña del superusuario."""

    # --------------------
    # Redis
    # --------------------
    redis_host: str = "localhost"
    """Host del servidor Redis."""

    redis_port: int = 6379
    """Puerto del servidor Redis."""

    redis_db: int = 0
    """Número de la base de datos de Redis (por defecto 0)."""

    # --------------------
    # Base de datos PostgreSQL
    # --------------------
    postgres_user: str = "postgres"
    """Usuario de la base de datos PostgreSQL."""

    postgres_password: str = "dbpass"
    """Contraseña del usuario de PostgreSQL."""

    postgres_server: str = "localhost"
    """Host o dirección del servidor PostgreSQL."""

    postgres_port: int = 5432
    """Puerto del servidor PostgreSQL."""

    postgres_db: str = "system"
    """Nombre de la base de datos PostgreSQL."""

    @computed_field
    @property
    def database_uri(self) -> PostgresDsn:
        """
        Construye la URL de conexión a PostgreSQL para SQLAlchemy/SQLModel.

        Returns:
            PostgresDsn: URL con el formato: postgresql+psycopg://usuario:contraseña@host:puerto/db
        """
        return PostgresDsn(
            str(
                MultiHostUrl.build(
                    scheme="postgresql+psycopg2",
                    username=self.postgres_user,
                    password=self.postgres_password,
                    host=self.postgres_server,
                    port=self.postgres_port,
                    path=self.postgres_db,
                )
            )
        )

    # --------------------
    # Configuración de correo electrónico (SMTP)
    # --------------------
    smtp_host: str = "smtp.example.com"
    """Servidor SMTP para enviar correos."""

    smtp_user: EmailStr = "user@example.com"
    """Usuario/correo para autenticación SMTP."""

    smtp_password: str = "password"
    """Contraseña del usuario SMTP."""

    emails_from_email: EmailStr = "from@example.com"
    """Correo electrónico que aparece como remitente."""

    emails_from_name: str = "From Name"
    """Nombre que aparece como remitente en los correos."""

    smtp_tls: bool = True
    """Indica si se debe usar TLS (True/False) para SMTP."""

    smtp_ssl: bool = False
    """Indica si se debe usar SSL (True/False) para SMTP."""

    smtp_port: int = 587
    """Puerto del servidor SMTP."""

    smtp_use_credentials: bool = True
    """Indica si el servidor SMTP requiere usuario y contraseña."""

    @computed_field
    @property
    def mail_config(self) -> ConnectionConfig:
        """
        Construye la configuración completa de correo para FastAPI-Mail.

        Returns:
            ConnectionConfig: Configuración lista para enviar correos electrónicos.
        """
        return ConnectionConfig(
            MAIL_USERNAME=self.smtp_user,
            MAIL_PASSWORD=SecretStr(self.smtp_password),
            MAIL_FROM=self.emails_from_email,
            MAIL_FROM_NAME=self.emails_from_name,
            MAIL_SERVER=self.smtp_host,
            MAIL_PORT=self.smtp_port,
            MAIL_STARTTLS=self.smtp_tls,
            MAIL_SSL_TLS=self.smtp_ssl,
            USE_CREDENTIALS=self.smtp_use_credentials,
            VALIDATE_CERTS=True,
            TEMPLATE_FOLDER=Path("backend/templates/emails"),
        )

    # --------------------
    # Configuración global de Pydantic
    # --------------------
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
    )
    """Configura Pydantic para leer variables desde `.env` y sin distinguir mayúsculas/minúsculas."""


@lru_cache()
def get_settings() -> Settings:
    """
    Obtiene una instancia única y en caché de :class:`Settings`.
    """
    return Settings()  # pyright: ignore[reportCallIssue]


# Instancia global de settings
settings: Settings = get_settings()
"""Instancia global de configuración disponible en toda la aplicación (.env).

:type: Settings
"""
