from backend.security.security_group import SecurityGroup


class RoleGroup(SecurityGroup):
    ROLE_VIEW = "admin.roles.view", "Permite ver roles y grupos de permisos."
    ROLE_CREATE = "admin.roles.create", "Permite crear roles."
    ROLE_UPDATE = "admin.roles.update", "Permite actualizar roles."
    ROLE_DELETE = "admin.roles.delete", "Permite eliminar roles."
    ROLE_PERMISSIONS_UPDATE = (
        "admin.roles.permissions.update",
        "Permite actualizar permisos de roles.",
    )
