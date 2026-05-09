from backend.security.security_group import SecurityGroup


class JugsGroup(SecurityGroup):
    JUGS_VIEW = "jugs.view", "Permite ver garrafones y su estado."
    JUGS_MOVEMENT_CREATE = "jugs.movement.create", "Permite registrar movimientos de garrafones."
    JUGS_STOCK_MANAGE = "jugs.stock.manage", "Permite gestionar el stock de garrafones."
