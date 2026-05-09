from backend.security.security_group import SecurityGroup


class CustomerGroup(SecurityGroup):
    CUSTOMER_VIEW = "customer.view", "Permite ver clientes."
    CUSTOMER_CREATE = "customer.create", "Permite crear clientes."
    CUSTOMER_UPDATE = "customer.update", "Permite actualizar datos de clientes."
    CUSTOMER_DELETE = "customer.delete", "Permite eliminar clientes."
    CUSTOMER_HISTORY_VIEW = "customer.history.view", "Permite ver el historial de un cliente."
