import POSLayout from "@/components/pos/pos-layout"
import { FileText, BarChart3, TrendingUp, DollarSign, Package, Users, Calendar } from "lucide-react"

const reportTypes = [
  {
    id: "ventas",
    title: "Reporte de Ventas",
    description: "Analisis detallado de ventas por periodo, producto y cliente",
    icon: DollarSign,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    id: "inventario",
    title: "Reporte de Inventario",
    description: "Estado actual del inventario, movimientos y stock bajo",
    icon: Package,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "garrafones",
    title: "Reporte de Garrafones",
    description: "Flujo circular de garrafones, prestamos y devoluciones",
    icon: TrendingUp,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
  },
  {
    id: "clientes",
    title: "Reporte de Clientes",
    description: "Analisis de clientes, frecuencia de compra y creditos",
    icon: Users,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  {
    id: "caja",
    title: "Reporte de Caja",
    description: "Cortes de caja, movimientos y metodos de pago",
    icon: BarChart3,
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    id: "rutas",
    title: "Reporte de Rutas",
    description: "Rendimiento de rutas, entregas y cobros",
    icon: FileText,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
]

const quickReports = [
  { label: "Ventas de Hoy", value: "$12,450", change: "+12.5%" },
  { label: "Ventas Esta Semana", value: "$68,200", change: "+8.3%" },
  { label: "Ventas Este Mes", value: "$245,800", change: "+15.2%" },
  { label: "Garrafones en Circulacion", value: "720", change: "+5" },
]

export default function ReportesPage() {
  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reportes</h1>
            <p className="text-muted-foreground">Genera y analiza reportes de tu negocio</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select className="h-10 px-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option>Hoy</option>
              <option>Esta semana</option>
              <option>Este mes</option>
              <option>Ultimo trimestre</option>
              <option>Este ano</option>
              <option>Personalizado</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickReports.map((report) => (
            <div key={report.label} className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{report.label}</p>
              <p className="text-2xl font-bold mt-1">{report.value}</p>
              <p className="text-sm text-success">{report.change}</p>
            </div>
          ))}
        </div>

        {/* Report Types */}
        <div>
          <h2 className="font-semibold mb-4">Tipos de Reportes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                className="bg-card border border-border rounded-lg p-6 text-left hover:border-primary transition-colors group"
              >
                <div
                  className={`h-12 w-12 rounded-lg ${report.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <report.icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{report.title}</h3>
                <p className="text-sm text-muted-foreground">{report.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Reportes Recientes</h2>
          </div>
          <div className="divide-y divide-border">
            {[
              { name: "Corte de Caja - 17 Ene 2024", type: "Caja", date: "17/01/2024 20:00" },
              { name: "Ventas Semanales", type: "Ventas", date: "15/01/2024 09:00" },
              { name: "Inventario General", type: "Inventario", date: "14/01/2024 18:30" },
              { name: "Garrafones por Cliente", type: "Garrafones", date: "12/01/2024 10:15" },
            ].map((report, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">{report.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">{report.date}</span>
                  <button className="text-sm text-primary hover:underline">Descargar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </POSLayout>
  )
}
