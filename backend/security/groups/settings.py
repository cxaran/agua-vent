from backend.security.security_group import SecurityGroup


class SettingsGroup(SecurityGroup):
    SETTINGS_COMPANY_UPDATE = "settings.company.update", "Permite actualizar datos de la empresa."
    SETTINGS_USERS_MANAGE = "settings.users.manage", "Permite gestionar usuarios: crear, editar, eliminar y asignar grupos."
    SETTINGS_ROLES_MANAGE = "settings.roles.manage", "Permite gestionar roles: crear, editar, eliminar y asignar permisos."
    SETTINGS_BRANCHES_MANAGE = "settings.branches.manage", "Permite gestionar sucursales: crear, editar y eliminar."
    SETTINGS_BACKUP_MANAGE = "settings.backup.manage", "Permite gestionar respaldos: crear, listar y eliminar."
