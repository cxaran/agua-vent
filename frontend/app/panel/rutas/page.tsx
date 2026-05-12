"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  Truck,
  Plus,
  Search,
  MapPin,
  User,
  Phone,
  Clock,
  Package,
  CheckCircle,
  Circle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Droplets,
  DollarSign,
  X,
} from "lucide-react"

// Mock routes data
const rutas = [
  {
    id: 1,
    name: "Ruta Norte",
    driver: "Pedro Sanchez",
    driverPhone: "555-1111",
    vehicle: "Camioneta Ford #12",
    status: "en_camino",
    startTime: "08:30",
    pedidos: 12,
    entregados: 8,
    garrafonesLlenos: 35,
    garrafonesVacios: 28,
    cobroPendiente: 450,
    cobroRealizado: 1200,
  },
  {
    id: 2,
    name: "Ruta Centro",
    driver: "Miguel Torres",
    driverPhone: "555-2222",
    vehicle: "Camioneta Ford #08",
    status: "pendiente",
    startTime: null,
    pedidos: 8,
    entregados: 0,
    garrafonesLlenos: 20,
    garrafonesVacios: 0,
    cobroPendiente: 800,
    cobroRealizado: 0,
  },
  {
    id: 3,
    name: "Ruta Sur",
    driver: "Luis Ramirez",
    driverPhone: "555-3333",
    vehicle: "Camioneta Ford #05",
    status: "en_camino",
    startTime: "09:00",
    pedidos: 15,
    entregados: 12,
    garrafonesLlenos: 45,
    garrafonesVacios: 38,
    cobroPendiente: 280,
    cobroRealizado: 1850,
  },
  {
    id: 4,
    name: "Ruta Poniente",
    driver: "Carlos Mendez",
    driverPhone: "555-4444",
    vehicle: "Camioneta Ford #03",
    status: "completada",
    startTime: "07:00",
    pedidos: 10,
    entregados: 10,
    garrafonesLlenos: 30,
    garrafonesVacios: 30,
    cobroPendiente: 0,
    cobroRealizado: 1500,
  },
]

const pedidosRutaNorte = [
  {
    id: 1,
    customer: "Maria Garcia",
    address: "Calle Principal 123",
    phone: "555-1234",
    garrafones: 5,
    vacios: 3,
    total: 150,
    status: "entregado",
    hora: "09:15",
  },
  {
    id: 2,
    customer: "Restaurant El Buen Sabor",
    address: "Av. Reforma 456",
    phone: "555-5678",
    garrafones: 10,
    vacios: 8,
    total: 300,
    status: "entregado",
    hora: "09:45",
  },
  {
    id: 3,
    customer: "Oficinas Norte",
    address: "Torre Empresarial Piso 5",
    phone: "555-8901",
    garrafones: 8,
    vacios: 6,
    total: 240,
    status: "entregado",
    hora: "10:30",
  },
  {
    id: 4,
    customer: "Consultorio Medico",
    address: "Plaza Medica Local 12",
    phone: "555-2345",
    garrafones: 3,
    vacios: 2,
    total: 90,
    status: "en_camino",
    hora: null,
  },
  {
    id: 5,
    customer: "Escuela Primaria",
    address: "Calle Educacion 789",
    phone: "555-6789",
    garrafones: 15,
    vacios: 12,
    total: 450,
    status: "pendiente",
    hora: null,
  },
]

const statusConfig = {
  pendiente: { label: "Pendiente", color: "bg-muted text-muted-foreground", icon: Circle },
  en_camino: { label: "En Camino", color: "bg-warning/10 text-warning", icon: Truck },
  completada: { label: "Completada", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelada: { label: "Cancelada", color: "bg-destructive/10 text-destructive", icon: AlertCircle },
}

const pedidoStatusConfig = {
  pendiente: { label: "Pendiente", color: "text-muted-foreground" },
  en_camino: { label: "En Camino", color: "text-warning" },
  entregado: { label: "Entregado", color: "text-success" },
  no_entregado: { label: "No Entregado", color: "text-destructive" },
}

export default function RutasPage() {
  const [selectedRoute, setSelectedRoute] = useState<(typeof rutas)[0] | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("todos")

  const filteredRutas = rutas.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.driver.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "todos" || r.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalPedidos = rutas.reduce((sum, r) => sum + r.pedidos, 0)
  const totalEntregados = rutas.reduce((sum, r) => sum + r.entregados, 0)
  const totalCobrado = rutas.reduce((sum, r) => sum + r.cobroRealizado, 0)

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Rutas y Entregas</h1>
            <p className="text-muted-foreground">Gestion de rutas de entrega y repartidores</p>
          </div>
          <button className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Nueva Ruta
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Rutas Activas</p>
            <p className="text-2xl font-bold">{rutas.filter((r) => r.status === "en_camino").length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Pedidos</p>
            <p className="text-2xl font-bold">{totalPedidos}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Entregados</p>
            <p className="text-2xl font-bold text-success">{totalEntregados}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pendientes</p>
            <p className="text-2xl font-bold text-warning">{totalPedidos - totalEntregados}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Cobrado Hoy</p>
            <p className="text-2xl font-bold text-primary">${totalCobrado.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar ruta o repartidor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            {["todos", "pendiente", "en_camino", "completada"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {status === "todos"
                  ? "Todas"
                  : status === "en_camino"
                  ? "En Camino"
                  : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRutas.map((ruta) => {
            const StatusIcon = statusConfig[ruta.status as keyof typeof statusConfig].icon
            return (
              <div
                key={ruta.id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
              >
                {/* Route Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{ruta.name}</h3>
                        <p className="text-xs text-muted-foreground">{ruta.vehicle}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        statusConfig[ruta.status as keyof typeof statusConfig].color
                      }`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig[ruta.status as keyof typeof statusConfig].label}
                    </span>
                  </div>

                  {/* Driver Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{ruta.driver}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{ruta.driverPhone}</span>
                    </div>
                    {ruta.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Inicio: {ruta.startTime}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Route Stats */}
                <div className="p-4 grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedidos</p>
                    <p className="font-semibold">
                      {ruta.entregados}/{ruta.pedidos}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Garrafones</p>
                    <p className="font-semibold text-primary">{ruta.garrafonesLlenos}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Vacios</p>
                    <p className="font-semibold">{ruta.garrafonesVacios}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cobrado</p>
                    <p className="font-semibold text-success">${ruta.cobroRealizado}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-4 pb-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all"
                      style={{ width: `${(ruta.entregados / ruta.pedidos) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-border flex gap-2">
                  <button
                    onClick={() => setSelectedRoute(ruta)}
                    className="flex-1 flex items-center justify-center gap-2 h-9 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalle
                  </button>
                  {ruta.status === "pendiente" && (
                    <button className="flex-1 flex items-center justify-center gap-2 h-9 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                      <Play className="h-4 w-4" />
                      Iniciar Ruta
                    </button>
                  )}
                  {ruta.status === "en_camino" && (
                    <button className="flex-1 flex items-center justify-center gap-2 h-9 bg-success text-success-foreground rounded-lg text-sm font-medium hover:bg-success/90 transition-colors">
                      <CheckCircle className="h-4 w-4" />
                      Finalizar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Route Detail Modal */}
        {selectedRoute && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedRoute.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoute.driver} | {selectedRoute.vehicle}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Route Summary */}
              <div className="p-4 grid grid-cols-4 gap-4 border-b border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Package className="h-4 w-4" />
                    <span className="text-xs">Pedidos</span>
                  </div>
                  <p className="text-xl font-bold">
                    {selectedRoute.entregados}/{selectedRoute.pedidos}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Droplets className="h-4 w-4" />
                    <span className="text-xs">Garrafones</span>
                  </div>
                  <p className="text-xl font-bold text-primary">{selectedRoute.garrafonesLlenos}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-xs">Vacios</span>
                  </div>
                  <p className="text-xl font-bold">{selectedRoute.garrafonesVacios}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs">Cobrado</span>
                  </div>
                  <p className="text-xl font-bold text-success">${selectedRoute.cobroRealizado}</p>
                </div>
              </div>

              {/* Orders List */}
              <div className="p-4">
                <h3 className="font-semibold mb-4">Pedidos de la Ruta</h3>
                <div className="space-y-3">
                  {pedidosRutaNorte.map((pedido, idx) => (
                    <div
                      key={pedido.id}
                      className={`p-4 rounded-lg border ${
                        pedido.status === "entregado"
                          ? "bg-success/5 border-success/20"
                          : pedido.status === "en_camino"
                          ? "bg-warning/5 border-warning/20"
                          : "bg-muted/50 border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">{pedido.customer}</p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{pedido.address}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{pedido.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-medium ${
                              pedidoStatusConfig[pedido.status as keyof typeof pedidoStatusConfig]
                                .color
                            }`}
                          >
                            {
                              pedidoStatusConfig[pedido.status as keyof typeof pedidoStatusConfig]
                                .label
                            }
                          </span>
                          {pedido.hora && (
                            <p className="text-xs text-muted-foreground">{pedido.hora}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Droplets className="h-4 w-4 text-primary" />
                          {pedido.garrafones} llenos
                        </span>
                        <span className="flex items-center gap-1">
                          <RotateCcw className="h-4 w-4 text-muted-foreground" />
                          {pedido.vacios} vacios
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <DollarSign className="h-4 w-4 text-success" />$
                          {pedido.total}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </POSLayout>
  )
}
