from backend.security.security_group import SecurityGroup


class InventoryGroup(SecurityGroup):
    INVENTORY_PRODUCT_VIEW = "inventory.product.view", "Permite ver productos del inventario."
    INVENTORY_PRODUCT_CREATE = "inventory.product.create", "Permite crear productos en el inventario."
    INVENTORY_PRODUCT_UPDATE = "inventory.product.update", "Permite actualizar productos del inventario."
    INVENTORY_PRODUCT_DELETE = "inventory.product.delete", "Permite eliminar productos del inventario."
    INVENTORY_STOCK_ADJUST = "inventory.stock.adjust", "Permite ajustar existencias del inventario."
