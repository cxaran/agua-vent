from backend.security.security_group import SecurityGroup


class UserAdminGroup(SecurityGroup):
    USER_VIEW = "admin.users.view", "Permite ver usuarios."
    USER_CREATE = "admin.users.create", "Permite crear usuarios."
    USER_UPDATE = "admin.users.update", "Permite actualizar usuarios."
    USER_DELETE = "admin.users.delete", "Permite eliminar usuarios."
    USER_ROLES_UPDATE = "admin.users.roles.update", "Permite actualizar roles de usuarios."
    USER_PASSWORD_RESET = "admin.users.password.reset", "Permite cambiar contraseñas de usuarios."
