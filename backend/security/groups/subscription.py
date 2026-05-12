from backend.security.security_group import SecurityGroup


class SubscriptionGroup(SecurityGroup):
    SUBSCRIPTION_VIEW = "admin.subscriptions.view", "Permite ver suscripciones."
    SUBSCRIPTION_CREATE = "admin.subscriptions.create", "Permite crear suscripciones."
    SUBSCRIPTION_UPDATE = "admin.subscriptions.update", "Permite actualizar suscripciones."
    SUBSCRIPTION_DELETE = "admin.subscriptions.delete", "Permite eliminar suscripciones."
    SUBSCRIPTION_PAYMENTS = "admin.subscriptions.payments", "Permite registrar pagos."
    SUBSCRIPTION_STATS = "admin.subscriptions.stats", "Permite ver estadísticas."
    SUBSCRIPTION_DEACTIVATE_EXPIRED = (
        "admin.subscriptions.deactivate_expired",
        "Permite desactivar suscripciones vencidas.",
    )
