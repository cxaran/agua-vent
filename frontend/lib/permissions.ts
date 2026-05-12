/**
 * Mapeo de rutas administrativas → permisos requeridos.
 *
 * Cada string identifica un permiso definido en el backend
 * vía la tabla `role_access`. Un usuario ve un item si tiene CUALQUIERA de
 * los permisos listados (OR).
 *
 * Los strings coinciden con los definidos en backend/security/groups/*.py
 */
export const ADMIN_PERMISSIONS = {
  users: [
    "admin.users.view",
    "admin.users.create",
    "admin.users.update",
    "admin.users.delete",
    "admin.users.roles.update",
    "admin.users.password.reset",
  ] as const,
  roles: [
    "admin.roles.view",
    "admin.roles.create",
    "admin.roles.update",
    "admin.roles.delete",
    "admin.roles.permissions.update",
  ] as const,
  subscriptions: [
    "admin.subscriptions.view",
    "admin.subscriptions.create",
    "admin.subscriptions.update",
    "admin.subscriptions.delete",
    "admin.subscriptions.payments",
    "admin.subscriptions.stats",
    "admin.subscriptions.deactivate_expired",
  ] as const,
} as const

/**
 * Lista plana de todos los permisos de administración.
 * Se usa para verificar si un usuario tiene ALGÚN acceso al área de admin.
 */
export const ALL_ADMIN_PERMISSIONS: readonly string[] = Object.values(
  ADMIN_PERMISSIONS
).flat()