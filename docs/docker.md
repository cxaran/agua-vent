# Docker

La entrada publica es `nginx`. El navegador no llama directo a FastAPI ni a Next.js.

```txt
browser -> nginx
  /        -> frontend:3000
  /api/*   -> backend:8000
```

## Desarrollo

```bash
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

Abrir:

```txt
http://localhost
```

En desarrollo:

| Servicio | Modo |
|---|---|
| `backend` | `uvicorn --reload` |
| `frontend` | `pnpm dev` |
| `nginx` | unico puerto publico |
| `postgres` | solo red interna Docker |
| `redis` | solo red interna Docker |

Si el puerto 80 esta ocupado, cambiar en `.env`:

```env
HTTP_PORT=3000
DOMAIN_AUTH_URL=http://localhost:3000
```

## Produccion

```bash
docker compose build backend frontend
docker compose up -d
```

En produccion solo `nginx` publica puerto:

```env
HTTP_PORT=80
DOMAIN_AUTH_URL=https://tu-dominio.com
```

## Migraciones

Las migraciones se crean en desarrollo y se aplican en produccion.

Crear migracion:

```bash
docker compose -f compose.yaml -f compose.dev.yaml run --rm backend alembic -c backend/alembic.ini revision --autogenerate -m "mensaje"
```

Aplicar en desarrollo:

```bash
docker compose -f compose.yaml -f compose.dev.yaml run --rm backend alembic -c backend/alembic.ini upgrade head
```

Aplicar en produccion:

```bash
docker compose build backend
docker compose --profile migrate run --rm migrate
docker compose up -d
```

`migrate` es un contenedor temporal. Ejecuta `alembic upgrade head` y termina.

## Dockerfiles

Hay un Dockerfile por aplicacion.

| Archivo | Targets |
|---|---|
| `backend/Dockerfile` | `dev`, `prod` |
| `frontend/Dockerfile` | `dev`, `builder`, `prod` |

## Variables

Compose carga `.env` con `env_file`. Dentro de Docker, los hosts internos son:

```env
POSTGRES_SERVER=postgres
REDIS_HOST=redis
```

Las llamadas del frontend deben ser relativas:

```ts
fetch("/api/v1/auth/login")
```
