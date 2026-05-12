#!/usr/bin/env python3
"""Operational CLI.

Wraps the most common Docker Compose, Alembic and deployment workflows behind
clear commands with safer defaults. Does not replace docker compose or alembic.
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from collections.abc import Callable, Mapping
from pathlib import Path

ROOT = Path(__file__).resolve().parent
COMPOSE_PROD: list[str] = ["-f", "compose.yaml"]
COMPOSE_DEV: list[str] = ["-f", "compose.yaml", "-f", "compose.dev.yaml"]


def info(msg: str) -> None:
    print(f"[INFO] {msg}")


def ok(msg: str) -> None:
    print(f"[OK] {msg}")


def warn(msg: str) -> None:
    print(f"[WARN] {msg}")


def err(msg: str) -> None:
    print(f"[ERROR] {msg}", file=sys.stderr)


def run(
    cmd: list[str],
    env: Mapping[str, str] | None = None,
    check: bool = True,
) -> int:
    print("$ " + " ".join(cmd))
    full_env: dict[str, str] | None = None
    if env is not None:
        full_env = {**os.environ, **env}
    result = subprocess.run(cmd, cwd=str(ROOT), env=full_env)
    if check and result.returncode != 0:
        err(f"Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)
    return result.returncode


def compose(
    args: list[str],
    files: list[str] | None = None,
    env_file: Path | None = None,
    env: Mapping[str, str] | None = None,
    check: bool = True,
) -> int:
    cmd: list[str] = ["docker", "compose"]
    if env_file is not None:
        cmd += ["--env-file", str(env_file)]
    cmd += (files if files is not None else COMPOSE_PROD) + args
    return run(cmd, env=env, check=check)


def require_env(env_path: str | None) -> Path:
    if not env_path:
        err("Missing --env path for production command.")
        print("Example:")
        print("  python run.py prod deploy --env /opt/agua-vent/.env")
        sys.exit(2)
    p = Path(env_path).expanduser()
    if not p.exists():
        err(f"Env file not found: {p}")
        sys.exit(2)
    if not p.is_file():
        err(f"Env path is not a file: {p}")
        sys.exit(2)
    if p.stat().st_size == 0:
        err(f"Env file is empty: {p}")
        sys.exit(2)
    local_env = (ROOT / ".env").resolve()
    try:
        if p.resolve() == local_env:
            warn("You are pointing production --env at the local ./.env file.")
    except OSError:
        pass
    return p


def prod_env(env_file: Path) -> dict[str, str]:
    return {"APP_ENV_FILE": str(env_file)}


def confirm(prompt: str) -> bool:
    try:
        ans = input(f"{prompt} [y/N] ").strip().lower()
    except EOFError:
        ans = ""
    return ans in ("y", "yes")


def prompt_choice(title: str, options: list[tuple[str, str]]) -> str | None:
    print()
    print(title)
    print("-" * len(title))
    for index, (key, label) in enumerate(options, start=1):
        print(f"  {index}. {label}")
    print("  0. Volver / salir")

    while True:
        try:
            ans = input("> ").strip().lower()
        except EOFError:
            return None

        if ans in ("0", "q", "quit", "exit", "salir"):
            return None

        if ans.isdigit():
            index = int(ans)
            if 1 <= index <= len(options):
                return options[index - 1][0]

        for key, label in options:
            if ans == key or ans == label.lower():
                return key

        warn("Opcion no valida. Elige un numero de la lista.")


def prompt_text(prompt: str, default: str | None = None) -> str | None:
    suffix = f" [{default}]" if default else ""
    try:
        value = input(f"{prompt}{suffix}: ").strip()
    except EOFError:
        return None
    return value or default


def interactive_args(command: str, action: str | None) -> argparse.Namespace:
    args = argparse.Namespace(command=command, action=action, help=False)

    if command == "db" and action == "revision":
        message = prompt_text("Mensaje para la migracion")
        if not message:
            err("La migracion necesita un mensaje.")
            sys.exit(2)
        args.message = message

    if command == "prod":
        env_path = prompt_text("Ruta del archivo .env de produccion")
        args.env = env_path
        args.yes = False

    if command == "logs":
        args.service = prompt_text("Servicio para logs", "backend")

    if command == "prune":
        args.yes = False

    return args


def guided_menu() -> int:
    print("agua-vent operational CLI")
    print("Modo guiado. Tambien puedes usar comandos directos como:")
    print("  python run.py dev up")

    sections = [
        ("general", "General: ayuda y diagnostico"),
        ("dev", "Desarrollo: levantar, detener o reconstruir servicios"),
        ("db", "Base de datos: migraciones de desarrollo"),
        ("prod", "Produccion: build, migraciones y deploy"),
        ("monitoring", "Monitoreo: estado, logs y recursos"),
        ("cleanup", "Limpieza: contenedores y cache sin volumenes"),
    ]

    actions: dict[str, list[tuple[str, str]]] = {
        "general": [
            ("doctor", "Revisar que el entorno este listo"),
            ("help", "Mostrar ayuda completa"),
        ],
        "dev": [
            ("up", "Levantar servicios de desarrollo con build"),
            ("down", "Detener servicios de desarrollo"),
            ("restart", "Reiniciar servicios de desarrollo"),
            ("rebuild", "Reconstruir sin cache y levantar"),
        ],
        "db": [
            ("revision", "Crear migracion Alembic autogenerada"),
            ("upgrade", "Aplicar migraciones pendientes"),
            ("current", "Ver revision actual"),
            ("history", "Ver historial de migraciones"),
        ],
        "prod": [
            ("build", "Construir imagenes de produccion"),
            ("migrate", "Aplicar migraciones en produccion"),
            ("up", "Levantar servicios de produccion"),
            ("deploy", "Build -> migrate -> up"),
        ],
        "monitoring": [
            ("status", "Ver estado de servicios"),
            ("logs", "Seguir logs de un servicio"),
            ("stats", "Ver uso de recursos de contenedores"),
        ],
        "cleanup": [
            ("clean", "Limpiar contenedores detenidos del entorno dev"),
            ("prune", "Ejecutar docker system prune sin volumenes"),
        ],
    }

    while True:
        section = prompt_choice("Que quieres hacer?", sections)
        if section is None:
            ok("Hasta luego.")
            return 0

        action = prompt_choice("Elige una accion", actions[section])
        if action is None:
            continue

        if section == "general":
            command, subaction = action, None
        elif section == "monitoring":
            command, subaction = action, None
        elif section == "cleanup":
            command, subaction = action, None
        else:
            command, subaction = section, action

        args = interactive_args(command, subaction)
        print()
        info("Ejecutando comando equivalente:")
        if subaction:
            print(f"  python run.py {command} {subaction}")
        else:
            print(f"  python run.py {command}")
        print()

        fn = DISPATCH.get((command, subaction))
        if fn is None:
            err("No se encontro la accion seleccionada.")
            return 2
        return fn(args)


# --- doctor ----------------------------------------------------------------

def cmd_doctor(_args: argparse.Namespace) -> int:
    info("Checking project...")
    print()
    failures = 0

    def check(label: str, passed: bool) -> None:
        nonlocal failures
        print(f"[{'OK' if passed else 'ERROR'}] {label}")
        if not passed:
            failures += 1

    docker_path = shutil.which("docker")
    check("docker installed", docker_path is not None)

    if docker_path:
        try:
            r = subprocess.run(
                ["docker", "compose", "version"],
                capture_output=True, text=True,
            )
            check("docker compose available", r.returncode == 0)
        except OSError:
            check("docker compose available", False)

        try:
            r = subprocess.run(
                ["docker", "info"],
                capture_output=True, text=True,
            )
            check("docker daemon running", r.returncode == 0)
        except OSError:
            check("docker daemon running", False)

    paths = [
        "compose.yaml",
        "compose.dev.yaml",
        ".env",
        "backend/Dockerfile",
        "frontend/Dockerfile",
        "backend/alembic.ini",
        "backend/alembic",
        "frontend/package.json",
    ]
    for rel in paths:
        check(f"{rel} found", (ROOT / rel).exists())

    print()
    if failures == 0:
        ok("Project looks ready.")
        return 0
    err(f"{failures} check(s) failed.")
    return 1


# --- dev -------------------------------------------------------------------

def cmd_dev_up(_args: argparse.Namespace) -> int:
    return compose(["up", "--build"], files=COMPOSE_DEV)


def cmd_dev_down(_args: argparse.Namespace) -> int:
    return compose(["down"], files=COMPOSE_DEV)


def cmd_dev_restart(_args: argparse.Namespace) -> int:
    return compose(["restart"], files=COMPOSE_DEV)


def cmd_dev_rebuild(_args: argparse.Namespace) -> int:
    compose(["build", "--no-cache"], files=COMPOSE_DEV)
    return compose(["up"], files=COMPOSE_DEV)


# --- db (development) ------------------------------------------------------

def _alembic(*alembic_args: str) -> list[str]:
    return [
        "run", "--rm", "backend",
        "alembic", "-c", "backend/alembic.ini", *alembic_args,
    ]


def cmd_db_revision(args: argparse.Namespace) -> int:
    message: str = args.message
    return compose(
        _alembic("revision", "--autogenerate", "-m", message),
        files=COMPOSE_DEV,
    )


def cmd_db_upgrade(_args: argparse.Namespace) -> int:
    return compose(_alembic("upgrade", "head"), files=COMPOSE_DEV)


def cmd_db_current(_args: argparse.Namespace) -> int:
    return compose(_alembic("current"), files=COMPOSE_DEV)


def cmd_db_history(_args: argparse.Namespace) -> int:
    return compose(_alembic("history"), files=COMPOSE_DEV)


# --- prod ------------------------------------------------------------------

def cmd_prod_build(args: argparse.Namespace) -> int:
    env_path: str | None = args.env
    env_file = require_env(env_path)
    return compose(
        ["build", "backend", "frontend", "migrate"],
        env_file=env_file, env=prod_env(env_file),
    )


def cmd_prod_migrate(args: argparse.Namespace) -> int:
    env_path: str | None = args.env
    env_file = require_env(env_path)
    return compose(
        ["--profile", "migrate", "run", "--rm", "migrate"],
        env_file=env_file, env=prod_env(env_file),
    )


def cmd_prod_up(args: argparse.Namespace) -> int:
    env_path: str | None = args.env
    env_file = require_env(env_path)
    return compose(["up", "-d"], env_file=env_file, env=prod_env(env_file))


def cmd_prod_deploy(args: argparse.Namespace) -> int:
    env_path: str | None = args.env
    skip_confirm: bool = bool(args.yes)
    env_file = require_env(env_path)
    env = prod_env(env_file)

    if not skip_confirm:
        print()
        print("Production deploy")
        print()
        print("Env file:")
        print(f"  {env_file}")
        print()
        print("Steps:")
        print("  1. Build production images")
        print("  2. Run Alembic migrations")
        print("  3. Start services")
        print()
        if not confirm("Continue?"):
            err("Aborted.")
            return 1

    info("Step 1/3: build")
    compose(["build", "backend", "frontend", "migrate"], env_file=env_file, env=env)

    info("Step 2/3: migrate")
    compose(["--profile", "migrate", "run", "--rm", "migrate"], env_file=env_file, env=env)

    info("Step 3/3: up")
    return compose(["up", "-d"], env_file=env_file, env=env)


# --- status / logs / stats -------------------------------------------------

def cmd_status(_args: argparse.Namespace) -> int:
    return run(["docker", "compose", "ps"])


def cmd_logs(args: argparse.Namespace) -> int:
    raw_service: str | None = args.service
    service: str = raw_service or "backend"
    return run(["docker", "compose", "logs", "-f", service])


def cmd_stats(_args: argparse.Namespace) -> int:
    return run(["docker", "stats"])


# --- clean / prune ---------------------------------------------------------

def cmd_clean(_args: argparse.Namespace) -> int:
    compose(["down", "--remove-orphans"], files=COMPOSE_DEV, check=False)
    return run(["docker", "container", "prune", "-f"])


def cmd_prune(args: argparse.Namespace) -> int:
    skip_confirm: bool = bool(args.yes)
    if not skip_confirm:
        warn("This will remove unused containers, networks, dangling images and build cache.")
        warn("Volumes will NOT be removed.")
        if not confirm("Continue?"):
            err("Aborted.")
            return 1
    return run(["docker", "system", "prune", "-f"])


# --- help ------------------------------------------------------------------

HELP_TEXT = """\
agua-vent operational CLI

Usage:
  python run.py <command> [args]
  python run.py                Start guided mode

General:
  help                        Show this help
  doctor                      Check that the environment is ready

Development:
  dev up                      Start dev services (hot reload)
  dev down                    Stop dev services
  dev restart                 Restart dev services
  dev rebuild                 Rebuild dev images without cache and start

Database (development):
  db revision "message"       Create new Alembic migration (autogenerate)
  db upgrade                  Apply migrations to dev DB
  db current                  Show current Alembic revision
  db history                  Show Alembic history

Production (require --env PATH):
  prod build   --env PATH     Build production images
  prod migrate --env PATH     Apply migrations on production DB
  prod up      --env PATH     Start production services (-d)
  prod deploy  --env PATH     Build -> migrate -> up (transactional)
                              Add --yes to skip the confirmation prompt

Monitoring:
  status                      Show service status
  logs [service]              Tail logs (default: backend)
  stats                       Show container resource usage

Cleanup:
  clean                       Remove stopped containers (safe)
  prune                       docker system prune -f (volumes preserved)

Examples:
  python run.py
  python run.py doctor
  python run.py dev up
  python run.py db revision "add customer credit limit"
  python run.py db upgrade
  python run.py prod deploy --env /opt/agua-vent/.env
  python run.py logs backend

Production must always receive its .env explicitly via --env.
The local ./.env is for development only.
When no command is provided, run.py opens a guided menu by category.
"""


def cmd_help(_args: argparse.Namespace) -> int:
    print(HELP_TEXT)
    return 0


# --- argparse --------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="run.py",
        description="agua-vent operational CLI",
        add_help=False,
    )
    p.add_argument("-h", "--help", action="store_true", help="Show help")
    sub = p.add_subparsers(dest="command")

    sub.add_parser("help", add_help=False)
    sub.add_parser("doctor", add_help=False)

    dev = sub.add_parser("dev", add_help=False)
    devsub = dev.add_subparsers(dest="action")
    for name in ("up", "down", "restart", "rebuild"):
        devsub.add_parser(name, add_help=False)

    db = sub.add_parser("db", add_help=False)
    dbsub = db.add_subparsers(dest="action")
    rev = dbsub.add_parser("revision", add_help=False)
    rev.add_argument("message")
    for name in ("upgrade", "current", "history"):
        dbsub.add_parser(name, add_help=False)

    prod = sub.add_parser("prod", add_help=False)
    prodsub = prod.add_subparsers(dest="action")
    for name in ("build", "migrate", "up", "deploy"):
        sp = prodsub.add_parser(name, add_help=False)
        sp.add_argument("--env", dest="env", default=None)
        if name == "deploy":
            sp.add_argument("--yes", action="store_true")

    sub.add_parser("status", add_help=False)
    logs = sub.add_parser("logs", add_help=False)
    logs.add_argument("service", nargs="?", default=None)
    sub.add_parser("stats", add_help=False)
    sub.add_parser("clean", add_help=False)
    pr = sub.add_parser("prune", add_help=False)
    pr.add_argument("--yes", action="store_true")

    return p


CommandFn = Callable[[argparse.Namespace], int]

DISPATCH: dict[tuple[str, str | None], CommandFn] = {
    ("help", None): cmd_help,
    ("doctor", None): cmd_doctor,
    ("dev", "up"): cmd_dev_up,
    ("dev", "down"): cmd_dev_down,
    ("dev", "restart"): cmd_dev_restart,
    ("dev", "rebuild"): cmd_dev_rebuild,
    ("db", "revision"): cmd_db_revision,
    ("db", "upgrade"): cmd_db_upgrade,
    ("db", "current"): cmd_db_current,
    ("db", "history"): cmd_db_history,
    ("prod", "build"): cmd_prod_build,
    ("prod", "migrate"): cmd_prod_migrate,
    ("prod", "up"): cmd_prod_up,
    ("prod", "deploy"): cmd_prod_deploy,
    ("status", None): cmd_status,
    ("logs", None): cmd_logs,
    ("stats", None): cmd_stats,
    ("clean", None): cmd_clean,
    ("prune", None): cmd_prune,
}


def main(argv: list[str] | None = None) -> int:
    raw_argv = sys.argv[1:] if argv is None else argv
    if not raw_argv:
        return guided_menu()

    parser = build_parser()
    args = parser.parse_args(raw_argv)

    show_help: bool = bool(getattr(args, "help", False))
    command: str | None = getattr(args, "command", None)

    if show_help or command == "help":
        return cmd_help(args)

    if command is None:
        cmd_help(args)
        return 2

    action: str | None = getattr(args, "action", None)
    fn = DISPATCH.get((command, action))
    if fn is None:
        cmd_help(args)
        return 2
    return fn(args)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        err("Interrupted.")
        sys.exit(130)
