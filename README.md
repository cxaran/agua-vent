# Agua Vent

Sistema de punto de venta y gestion para purificadoras de agua.

## Stack

| Capa | Tecnologia |
|---|---|
| Frontend | Next.js |
| Backend | FastAPI |
| Base de datos | PostgreSQL |
| Cache | Redis |
| Proxy | nginx |
| Migraciones | Alembic |

## Arquitectura

La entrada publica es `nginx`.

```txt
browser -> nginx
  /        -> frontend:3000
  /api/*   -> backend:8000
```

El navegador no llama directo a FastAPI. Las llamadas del frontend usan rutas relativas, por ejemplo:

```ts
fetch("/api/v1/auth/login")
```

## Desarrollo

```bash
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

Abrir:

```txt
http://localhost
```

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

Solo `nginx` publica puerto al host. `backend`, `frontend`, `postgres` y `redis` quedan en la red interna de Docker.

## Migraciones

Crear migracion en desarrollo:

```bash
docker compose -f compose.yaml -f compose.dev.yaml run --rm backend alembic -c backend/alembic.ini revision --autogenerate -m "mensaje"
```

Aplicar migraciones en produccion:

```bash
docker compose build backend
docker compose --profile migrate run --rm migrate
docker compose up -d
```

## Documentacion

| Documento | Contenido |
|---|---|
| `docs/docker.md` | Docker, nginx, dev, prod y migraciones |
| `docs/arquitectura.md` | Estructura general del proyecto |
| `docs/auth-flow.md` | Flujo de autenticacion |
| `docs/permisos.md` | Grupos y permisos |
| `docs/routes_summary.md` | Rutas principales de la API |

## Licencia

MIT. Ver `LICENSE`.
