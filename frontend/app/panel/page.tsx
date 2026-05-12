import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Droplets,
  Clock,
  AlertTriangle,
} from "lucide-react"
import POSLayout from "@/components/pos/pos-layout"

// Mock data for dashboard
const stats = [
  {
    label: "Ventas Hoy",
    value: "$12,450",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-chart-1",
  },
  {
    label: "Transacciones",
    value: "48",
    change: "+8",
    trend: "up",
    icon: ShoppingCart,
    color: "text-chart-2",
  },
  {
    label: "Garrafones Vendidos",
    value: "156",
    change: "-3",
    trend: "down",
    icon: Droplets,
    color: "text-primary",
  },
  {
    label: "Clientes Atendidos",
    value: "32",
    change: "+5",
    trend: "up",
    icon: Users,
    color: "text-chart-3",
  },
]

const recentSales = [
  { id: "V-001", customer: "Maria Garcia", items: "5 garrafones", total: "$150", time: "Hace 5 min" },
  { id: "V-002", customer: "Juan Lopez", items: "3 garrafones + rellenado", total: "$95", time: "Hace 12 min" },
  { id: "V-003", customer: "Ana Martinez", items: "10 garrafones", total: "$300", time: "Hace 25 min" },
  { id: "V-004", customer: "Carlos Ruiz", items: "2 garrafones", total: "$60", time: "Hace 38 min" },
  { id: "V-005", customer: "Sofia Hernandez", items: "8 garrafones", total: "$240", time: "Hace 45 min" },
]

const lowStock = [
  { product: "Garrafon 20L Nuevo", stock: 5, min: 20 },
  { product: "Tapa Azul Estandar", stock: 12, min: 50 },
  { product: "Etiqueta Personalizada", stock: 8, min: 100 },
]

const pendingDeliveries = [
  { route: "Ruta Norte", driver: "Pedro Sanchez", orders: 12, status: "En camino" },
  { route: "Ruta Centro", driver: "Miguel Torres", orders: 8, status: "Pendiente" },
  { route: "Ruta Sur", driver: "Luis Ramirez", orders: 15, status: "En camino" },
]

export default function DashboardPage() {
  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de operaciones del dia</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <div className="mt-1 flex items-center gap-1 text-sm">
                {stat.trend === "up" ? (
                  <>
                    <ArrowUpRight className="h-4 w-4 text-success" />
                    <span className="text-success">{stat.change}</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">{stat.change}</span>
                  </>
                )}
                <span className="text-muted-foreground">vs ayer</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Sales */}
          <div className="lg:col-span-2 bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Ventas Recientes</h2>
              <button className="text-sm text-primary hover:underline">Ver todas</button>
            </div>
            <div className="divide-y divide-border">
              {recentSales.map((sale) => (
                <div key={sale.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{sale.customer}</p>
                      <p className="text-sm text-muted-foreground">{sale.items}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{sale.total}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sale.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Low Stock Alert */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h2 className="font-semibold">Stock Bajo</h2>
              </div>
              <div className="divide-y divide-border">
                {lowStock.map((item) => (
                  <div key={item.product} className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.product}</span>
                      <span className="text-sm text-destructive font-semibold">
                        {item.stock}/{item.min}
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-destructive rounded-full"
                        style={{ width: `${(item.stock / item.min) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Deliveries */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">Entregas Pendientes</h2>
              </div>
              <div className="divide-y divide-border">
                {pendingDeliveries.map((delivery) => (
                  <div key={delivery.route} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{delivery.route}</p>
                        <p className="text-sm text-muted-foreground">{delivery.driver}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          delivery.status === "En camino"
                            ? "bg-success/20 text-success"
                            : "bg-warning/20 text-warning"
                        }`}
                      >
                        {delivery.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {delivery.orders} pedidos
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Acciones Rapidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "Nueva Venta", icon: ShoppingCart, href: "/ventas" },
              { label: "Registrar Pago", icon: DollarSign, href: "/caja" },
              { label: "Entrada Inventario", icon: Package, href: "/inventario" },
              { label: "Nuevo Cliente", icon: Users, href: "/clientes" },
              { label: "Nueva Ruta", icon: TrendingUp, href: "/rutas" },
              { label: "Ver Reportes", icon: TrendingDown, href: "/reportes" },
            ].map((action) => (
              <button
                key={action.label}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <action.icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </POSLayout>
  )
}
