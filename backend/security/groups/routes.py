from backend.security.security_group import SecurityGroup


class RoutesGroup(SecurityGroup):
    ROUTES_VIEW = "routes.view", "Permite ver rutas de reparto."
    ROUTES_CREATE = "routes.create", "Permite crear rutas de reparto."
    DELIVERIES_ASSIGN = "deliveries.assign", "Permite asignar entregas a rutas."
    DELIVERIES_TRACK = "deliveries.track", "Permite rastrear entregas en tiempo real."
