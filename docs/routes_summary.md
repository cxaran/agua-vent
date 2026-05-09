# API Routes Summary

This report details the endpoints exposed by the authentication routes.

## Authentication Routes (Prefix: /api/v1/auth)

The primary router aggregates routes from `backend/routes/auth.py`, and cuando se incluye con los prefijos globales `/api/v1`, la ruta completa es:

### **Authentication Router (`/api/v1/auth`)**

Este router maneja todos los flujos de endpoints de autenticación.

| Method | Endpoint (Relative) | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Inicio de sesión de usuario usando correo y contraseña. Devuelve un token de acceso. |
| `POST` | `/api/v1/auth/register/request` | Inicia el registro de usuario generando y enviando un token al correo electrónico. |
| `POST` | `/api/v1/auth/register/confirm` | Completa el registro de usuario usando el token generado. |
| `POST` | `/api/v1/auth/forgot-password` | Solicita un token de recuperación de contraseña enviado al correo electrónico del usuario. |
| `POST` | `/api/v1/auth/reset-password` | Restablece la contraseña usando el token proporcionado. |
| `GET` | `/api/v1/auth/unlock-account/{token}` | Desbloquea una cuenta con un token específico. |
| `POST` | `/api/v1/auth/logout` | Cierra la sesión eliminando la cookie de sesión. |
| `GET` | `/api/v1/auth/me` | Recupera la información del perfil del usuario actual. |
