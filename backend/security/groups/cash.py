from backend.security.security_group import SecurityGroup


class CashGroup(SecurityGroup):
    CASH_OPEN = "cash.open", "Permite abrir caja."
    CASH_CLOSE = "cash.close", "Permite cerrar caja."
    CASH_INCOME_CREATE = "cash.income.create", "Permite registrar ingresos en caja."
    CASH_EXPENSE_CREATE = "cash.expense.create", "Permite registrar egresos en caja."
    CASH_MOVEMENT_VIEW = "cash.movement.view", "Permite ver movimientos de caja."
    CASH_RECONCILIATION_PERFORM = "cash.reconciliation.perform", "Permite realizar arqueos de caja."
