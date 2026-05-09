from backend.security.security_group import SecurityGroup


class ReportsGroup(SecurityGroup):
    REPORTS_SALES_VIEW = "reports.sales.view", "Permite ver reportes de ventas."
    REPORTS_INVENTORY_VIEW = "reports.inventory.view", "Permite ver reportes de inventario."
    REPORTS_FINANCIAL_VIEW = "reports.financial.view", "Permite ver reportes financieros."
    REPORTS_EXPORT = "reports.export", "Permite exportar reportes."
    REPORTS_FILTER = "reports.filter", "Permite filtrar reportes."
