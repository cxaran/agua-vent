# Autenticacion y Permisos - Agua Vent

## Flujo de Autenticacion

### 1. Registro
```
POST /api/v1/auth/register/request  →  genera token y envia email
POST /api/v1/auth/register/confirm  →  valida token y crea usuario
```

### 2. Login
```
POST /api/v1/auth/login  →  autentica credenciales, retorna JWT + cookie
```

### 3. Recuperacion de Contrasena
```
POST /api/v1/auth/forgot-password  →  genera token y envia email
POST /api/v1/auth/reset-password   →  valida token y cambia contrasena
```

### 4. Desbloqueo de Cuenta
```
GET /api/v1/auth/unlock-account/{token}  →  valida token y desbloquea
```

### 5. Sesion
```
GET /api/v1/auth/me     →  info del usuario autenticado
POST /api/v1/auth/logout  →  elimina cookie de sesion
```

## Modelo de Permisos (RBAC)

```
User ──M:N── UserRole ──N:1── Role ──1:N── RoleAccess
                                              └── access: str (ej: "users:read", "*")
```

### Resolucion

1. JWT decode → `sub` (user.id), `jti` (user.token version)
2. Redis cache `user_session:{id}` (TTL 45s)
3. Si cache miss → DB query:
   - Validar `user.is_active` y `user.token == jti`
   - `SELECT RoleAccess.access FROM role_access JOIN user_role ... WHERE user_id = ?`
4. `UserBase.permissions = Set[str]` (set plano de strings de acceso)
5. `SecurityControl.check()` → `access in permissions` o wildcard `"*"`

## Invalidacion de Sesiones

Cambiar `user.token` (al resetear password, cambiar email, desactivar cuenta)
→ todos los JWTs con `jti` anterior son rechazados en `get_current_user`.

## Anti-Bruteforce

Contador en Redis `failed_logins:{user.id}`, bloqueo progresivo:
- `locked_time = floor(1 * (1.2)^(n-1))` minutos
- Token de desbloqueo enviado por email
- `locked_until` en DB hasta la fecha de expiracion

## Seguridad

| Componente | Detalle |
|---|---|
| Hash passwords | argon2 (passlib) |
| JWT | HS256, exp 24h |
| Cookie | httponly, secure, samesite=lax |
| Validacion password | min 6-8 chars, lowercase + digit |
| Email tokens | TTL 48h, bidirectional en Redis |
| Session cache | Redis 45s TTL |
