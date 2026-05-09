# Grupos de Permisos - Agua Vent

Cada grupo es un `Enum` que extiende `SecurityGroup`. Cada miembro define una clave de acceso y su descripción. Los permisos se usan directamente en dependencias de FastAPI via `.requiere`.

```
backend/security/groups/
├── dashboard.py   →  DashboardGroup
├── pos.py         →  PosGroup
├── inventory.py   →  InventoryGroup
├── jugs.py        →  JugsGroup
├── customer.py    →  CustomerGroup
├── routes.py      →  RoutesGroup
├── cash.py        →  CashGroup
├── reports.py     →  ReportsGroup
└── settings.py    →  SettingsGroup
```

## Uso en endpoint

```python
from backend.security.groups.pos import PosGroup

@router.post("/sale")
async def create_sale(_: Annotated[bool, PosGroup.POS_SALE_CREATE.requiere]):
    ...
```

---

## Dashboard

`backend/security/groups/dashboard.py` — `DashboardGroup`

| Permiso | Clave |
|---|---|
| DASHBOARD_VIEW | `dashboard.view` |
| DASHBOARD_METRICS_VIEW | `dashboard.metrics.view` |

---

## Point of Sale

`backend/security/groups/pos.py` — `PosGroup`

| Permiso | Clave |
|---|---|
| POS_SALE_CREATE | `pos.sale.create` |
| POS_SALE_UPDATE | `pos.sale.update` |
| POS_SALE_CANCEL | `pos.sale.cancel` |
| POS_PAYMENT_PROCESS | `pos.payment.process` |
| POS_RECEIPT_PRINT | `pos.receipt.print` |

---

## Inventory

`backend/security/groups/inventory.py` — `InventoryGroup`

| Permiso | Clave |
|---|---|
| INVENTORY_PRODUCT_VIEW | `inventory.product.view` |
| INVENTORY_PRODUCT_CREATE | `inventory.product.create` |
| INVENTORY_PRODUCT_UPDATE | `inventory.product.update` |
| INVENTORY_PRODUCT_DELETE | `inventory.product.delete` |
| INVENTORY_STOCK_ADJUST | `inventory.stock.adjust` |

---

## Jugs (Garrafones)

`backend/security/groups/jugs.py` — `JugsGroup`

| Permiso | Clave |
|---|---|
| JUGS_VIEW | `jugs.view` |
| JUGS_MOVEMENT_CREATE | `jugs.movement.create` |
| JUGS_STOCK_MANAGE | `jugs.stock.manage` |

---

## Customer

`backend/security/groups/customer.py` — `CustomerGroup`

| Permiso | Clave |
|---|---|
| CUSTOMER_VIEW | `customer.view` |
| CUSTOMER_CREATE | `customer.create` |
| CUSTOMER_UPDATE | `customer.update` |
| CUSTOMER_DELETE | `customer.delete` |
| CUSTOMER_HISTORY_VIEW | `customer.history.view` |

---

## Routes & Deliveries

`backend/security/groups/routes.py` — `RoutesGroup`

| Permiso | Clave |
|---|---|
| ROUTES_VIEW | `routes.view` |
| ROUTES_CREATE | `routes.create` |
| DELIVERIES_ASSIGN | `deliveries.assign` |
| DELIVERIES_TRACK | `deliveries.track` |

---

## Cash Register

`backend/security/groups/cash.py` — `CashGroup`

| Permiso | Clave |
|---|---|
| CASH_OPEN | `cash.open` |
| CASH_CLOSE | `cash.close` |
| CASH_INCOME_CREATE | `cash.income.create` |
| CASH_EXPENSE_CREATE | `cash.expense.create` |
| CASH_MOVEMENT_VIEW | `cash.movement.view` |
| CASH_RECONCILIATION_PERFORM | `cash.reconciliation.perform` |

---

## Reports

`backend/security/groups/reports.py` — `ReportsGroup`

| Permiso | Clave |
|---|---|
| REPORTS_SALES_VIEW | `reports.sales.view` |
| REPORTS_INVENTORY_VIEW | `reports.inventory.view` |
| REPORTS_FINANCIAL_VIEW | `reports.financial.view` |
| REPORTS_EXPORT | `reports.export` |
| REPORTS_FILTER | `reports.filter` |

---

## Settings

`backend/security/groups/settings.py` — `SettingsGroup`

| Permiso | Clave |
|---|---|
| SETTINGS_COMPANY_UPDATE | `settings.company.update` |
| SETTINGS_USERS_MANAGE | `settings.users.manage` |
| SETTINGS_ROLES_MANAGE | `settings.roles.manage` |
| SETTINGS_BRANCHES_MANAGE | `settings.branches.manage` |
| SETTINGS_BACKUP_MANAGE | `settings.backup.manage` |
