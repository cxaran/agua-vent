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

## run.py

CLI de operaciones que envuelve Docker Compose, Alembic y deployments con valores seguros por defecto.

```bash
python run.py <command> [args]
```

| Comando | Descripcion |
|---|---|
| `help` | Mostrar ayuda completa |
| `doctor` | Verificar que el entorno esta listo |
| `dev up` | Iniciar servicios de desarrollo (hot reload) |
| `dev down` | Detener servicios de desarrollo |
| `dev restart` | Reiniciar servicios de desarrollo |
| `dev rebuild` | Reconstruir imagenes sin cache e iniciar |
| `db revision "mensaje"` | Crear migracion Alembic (autogenerate) |
| `db upgrade` | Aplicar migraciones en desarrollo |
| `db current` | Mostrar revision actual de Alembic |
| `db history` | Mostrar historial de Alembic |
| `prod build --env PATH` | Construir imagenes de produccion |
| `prod migrate --env PATH` | Aplicar migraciones en produccion |
| `prod up --env PATH` | Iniciar servicios de produccion |
| `prod deploy --env PATH` | Build -> migrate -> up (requiere `--env`) |
| `status` | Mostrar estado de servicios |
| `logs [service]` | Ver logs (default: backend) |
| `stats` | Uso de recursos de contenedores |
| `clean` | Eliminar contenedores detenidos |
| `prune` | `docker system prune -f` (volumes no se borran) |

Ejemplos:

```bash
python run.py doctor
python run.py dev up
python run.py db revision "add customer credit limit"
python run.py db upgrade
python run.py prod deploy --env /opt/agua-vent/.env
python run.py logs backend
```

Los comandos `prod *` requieren `--env PATH` apuntando al archivo `.env` de produccion.

## Desarrollo

```bash
python run.py dev up
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
python run.py prod deploy --env /opt/agua-vent/.env
```

Solo `nginx` publica puerto al host. `backend`, `frontend`, `postgres` y `redis` quedan en la red interna de Docker.

## Migraciones

Crear migracion:

```bash
python run.py db revision "mensaje"
```

Aplicar migraciones:

```bash
python run.py db upgrade
```

## Documentacion

| Documento | Contenido |
|---|---|
| `run.py` | CLI de operaciones (dev, prod, db, logs, etc.) |
| `docs/docker.md` | Docker, nginx, dev, prod y migraciones |
| `docs/arquitectura.md` | Estructura general del proyecto |
| `docs/auth-flow.md` | Flujo de autenticacion |
| `docs/permisos.md` | Grupos y permisos |
| `docs/routes_summary.md` | Rutas principales de la API |

## Licencia

MIT. Ver `LICENSE`.
