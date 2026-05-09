from backend.security.security_group import SecurityGroup


class DashboardGroup(SecurityGroup):
    DASHBOARD_VIEW = "dashboard.view", "Permite ver el dashboard principal."
    DASHBOARD_METRICS_VIEW = "dashboard.metrics.view", "Permite ver métricas del dashboard."
