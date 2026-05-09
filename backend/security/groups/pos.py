from backend.security.security_group import SecurityGroup


class PosGroup(SecurityGroup):
    POS_SALE_CREATE = "pos.sale.create", "Permite crear una nueva venta."
    POS_SALE_UPDATE = "pos.sale.update", "Permite modificar una venta existente."
    POS_SALE_CANCEL = "pos.sale.cancel", "Permite cancelar una venta."
    POS_PAYMENT_PROCESS = "pos.payment.process", "Permite procesar pagos."
    POS_RECEIPT_PRINT = "pos.receipt.print", "Permite imprimir recibos."
