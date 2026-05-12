#!/usr/bin/env python3
"""Consola corta para roles, permisos y roles de usuarios."""
from __future__ import annotations

import os
import subprocess
import sys
import uuid
from pathlib import Path


ROOT = Path(__file__).resolve().parent
COMPOSE = ["docker", "compose", "-f", "compose.yaml", "-f", "compose.dev.yaml"]


def env_value(name: str, default: str) -> str:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return default
    for line in env_path.read_text(encoding="utf-8").splitlines():
        if line.startswith(f"{name}="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    return os.environ.get(name, default)


DB_USER = env_value("POSTGRES_USER", "postgres")
DB_NAME = env_value("POSTGRES_DB", "system")


def q(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def run_sql(sql: str) -> int:
    cmd = [
        *COMPOSE,
        "exec",
        "-T",
        "postgres",
        "psql",
        "-U",
        DB_USER,
        "-d",
        DB_NAME,
        "-v",
        "ON_ERROR_STOP=1",
        "-c",
        sql,
    ]
    return subprocess.call(cmd, cwd=ROOT)


def prompt(label: str) -> str:
    return input(f"{label}: ").strip()


def list_users() -> int:
    return run_sql(
        'select email, name, last_name, is_active from "user" order by email;'
    )


def list_roles() -> int:
    return run_sql("select name, description, is_active from role order by name;")


def create_role() -> int:
    name = prompt("Nombre del rol")
    description = prompt("Descripcion")
    return run_sql(
        "insert into role (id, name, description, is_active) values "
        f"({q(str(uuid.uuid4()))}, {q(name)}, {q(description)}, true);"
    )


def delete_role() -> int:
    name = prompt("Nombre del rol a eliminar")
    return run_sql(
        "delete from user_role where role_id in "
        f"(select id from role where name = {q(name)}); "
        "delete from role_access where role_id in "
        f"(select id from role where name = {q(name)}); "
        f"delete from role where name = {q(name)};"
    )


def list_permissions() -> int:
    role = prompt("Rol")
    return run_sql(
        "select ra.access, ra.is_active "
        "from role_access ra join role r on r.id = ra.role_id "
        f"where r.name = {q(role)} order by ra.access;"
    )


def add_permission() -> int:
    role = prompt("Rol").strip()
    raw_access = prompt("Permiso(s) separados por coma (ej. admin.users.view, admin.roles.view o *)")

    accesses = list(dict.fromkeys(
        access.strip()
        for access in raw_access.split(",")
        if access.strip()
    ))

    if not accesses:
        print("No se ingresó ningún permiso.")
        return 0

    values = ", ".join(
        f"({q(str(uuid.uuid4()))}::uuid, {q(access)})"
        for access in accesses
    )

    return run_sql(
        "insert into role_access (id, role_id, access, is_active) "
        "select v.id, r.id, v.access, true "
        "from role r "
        f"cross join (values {values}) as v(id, access) "
        f"where r.name = {q(role)} "
        "on conflict (role_id, access) do update set is_active = true;"
    )


def delete_permission() -> int:
    role = prompt("Rol")
    access = prompt("Permiso string a eliminar")
    return run_sql(
        "delete from role_access where access = "
        f"{q(access)} and role_id in (select id from role where name = {q(role)});"
    )


def assign_role() -> int:
    email = prompt("Email del usuario")
    role = prompt("Rol")
    return run_sql(
        "insert into user_role (id, user_id, role_id) "
        f"select {q(str(uuid.uuid4()))}, u.id, r.id "
        'from "user" u, role r '
        f"where u.email = {q(email)} and r.name = {q(role)} "
        "on conflict (user_id, role_id) do nothing;"
    )


def remove_role() -> int:
    email = prompt("Email del usuario")
    role = prompt("Rol")
    return run_sql(
        "delete from user_role where user_id in "
        f'(select id from "user" where email = {q(email)}) '
        f"and role_id in (select id from role where name = {q(role)});"
    )


def user_roles() -> int:
    email = prompt("Email del usuario")
    return run_sql(
        'select r.name, r.description, r.is_active from "user" u '
        "join user_role ur on ur.user_id = u.id "
        "join role r on r.id = ur.role_id "
        f"where u.email = {q(email)} order by r.name;"
    )


def user_permissions() -> int:
    email = prompt("Email del usuario")
    return run_sql(
        'select r.name as role, ra.access, ra.is_active from "user" u '
        "join user_role ur on ur.user_id = u.id "
        "join role r on r.id = ur.role_id "
        "join role_access ra on ra.role_id = r.id "
        f"where u.email = {q(email)} order by r.name, ra.access;"
    )


MENU = [
    ("Listar usuarios", list_users),
    ("Listar roles", list_roles),
    ("Crear rol", create_role),
    ("Eliminar rol", delete_role),
    ("Listar permisos de rol", list_permissions),
    ("Agregar permiso a rol", add_permission),
    ("Eliminar permiso de rol", delete_permission),
    ("Asignar rol a usuario", assign_role),
    ("Quitar rol a usuario", remove_role),
    ("Ver roles de usuario", user_roles),
    ("Ver permisos de usuario", user_permissions),
]


def menu() -> int:
    while True:
        print("\nusers.py")
        print("--------")
        for index, (label, _) in enumerate(MENU, start=1):
            print(f"{index}. {label}")
        print("0. Salir")
        choice = prompt("Opcion")
        if choice == "0":
            return 0
        if choice.isdigit() and 1 <= int(choice) <= len(MENU):
            MENU[int(choice) - 1][1]()
        else:
            print("Opcion no valida")


def main(argv: list[str]) -> int:
    commands = {
        "users": list_users,
        "roles": list_roles,
        "create-role": create_role,
        "delete-role": delete_role,
        "permissions": list_permissions,
        "add-permission": add_permission,
        "delete-permission": delete_permission,
        "assign-role": assign_role,
        "remove-role": remove_role,
        "user-roles": user_roles,
        "user-permissions": user_permissions,
    }
    if len(argv) > 1:
        fn = commands.get(argv[1])
        if fn is None:
            print("Comandos:", ", ".join(commands))
            return 2
        return fn()
    return menu()


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
