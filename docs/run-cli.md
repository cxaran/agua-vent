# CLI Operacional (`run.py`)

Wraps de Docker Compose, Alembic y flujos de despliegue con defaults seguros. No reemplaza `docker compose` ni `alembic`.

Uso:

```bash
python run.py <command> [args]
```

## General

| Comando | Descripción |
|---|---|
| `help` | Mostrar ayuda |
| `doctor` | Verificar que el entorno está listo (docker, compose, archivos) |

## Desarrollo

| Comando | Descripción |
|---|---|
| `dev up` | Levantar servicios con hot reload |
| `dev down` | Detener servicios de desarrollo |
| `dev restart` | Reiniciar servicios |
| `dev rebuild` | Rebuild sin cache y levantar |

 equivalente manual:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

## Base de datos (desarrollo)

| Comando | Descripción |
|---|---|
| `db revision "mensaje"` | Crear migración Alembic (autogenerate) |
| `db upgrade` | Aplicar migraciones pendientes |
| `db current` | Mostrar revisión actual |
| `db history` | Mostrar historial de migraciones |

## Producción (requiere `--env PATH`)

| Comando | Descripción |
|---|---|
| `prod build --env PATH` | Build de imágenes de producción |
| `prod migrate --env PATH` | Aplicar migraciones en producción |
| `prod up --env PATH` | Levantar servicios de producción (`-d`) |
| `prod deploy --env PATH` | Build → migrate → up (con confirmación; `--yes` para saltar) |

El archivo `.env` de producción es obligatorio y debe pasarse explícitamente. El `.env` local es solo para desarrollo.

## Monitoreo

| Comando | Descripción |
|---|---|
| `status` | Estado de servicios (`docker compose ps`) |
| `logs [servicio]` | Ver logs en vivo (default: `backend`) |
| `stats` | Uso de recursos de contenedores |

## Limpieza

| Comando | Descripción |
|---|---|
| `clean` | Eliminar contenedores detenidos (seguro) |
| `prune` | `docker system prune -f` (volúmenes preservados; `--yes` para saltar confirmación) |

## Ejemplos

```bash
python run.py doctor
python run.py dev up
python run.py db revision "add customer credit limit"
python run.py db upgrade
python run.py prod deploy --env /opt/agua-vent/.env
python run.py logs backend
```