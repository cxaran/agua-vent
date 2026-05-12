# Arquitectura del Proyecto

## Configuración Inicial

Core del proyecto, elementos iniciales de la API y conexiones:

- `backend/core/settings.py`
- `backend/core/database.py`
- `backend/core/redis.py`

## Autenticación y Sesión

Tablas de usuario en la base de datos:

- `backend/models/base.py`
- `backend/models/user.py`

Esquemas para autenticación y manejo de sesión:

- `backend/schemas/user.py`
- `backend/schemas/auth.py`

Manejo de roles y permisos:

- `backend/security/security_control.py`
- `backend/security/security_group.py`

## Envío de Emails

- `backend/utils/send_email.py`

### Templates de Email

- `backend/app/templates/emails/forgot_password.html`
- `backend/app/templates/emails/locked.html`
- `backend/app/templates/emails/verification.html`

## Autenticación

- `backend/auth/security.py`
- `backend/auth/token_store.py`
- `backend/auth/register.py`
- `backend/auth/forgot_password.py`
- `backend/auth/account_lock.py`
- `backend/auth/auth.py`
- `backend/auth/auth_dependencies.py`

## Infraestructura Docker

Ver [`docs/docker.md`](../docker.md):

- `compose.yaml`
- `compose.dev.yaml`
- `nginx/nginx.conf`
- `backend/Dockerfile`
- `frontend/Dockerfile`

## CLI Operacional

Ver [`docs/run-cli.md`](../run-cli.md):

- `run.py`

## Grupos de Permisos

Ver [`docs/permisos.md`](../permisos.md):

- `backend/security/groups/dashboard.py`
- `backend/security/groups/pos.py`
- `backend/security/groups/inventory.py`
- `backend/security/groups/jugs.py`
- `backend/security/groups/customer.py`
- `backend/security/groups/routes.py`
- `backend/security/groups/cash.py`
- `backend/security/groups/reports.py`
- `backend/security/groups/settings.py`
