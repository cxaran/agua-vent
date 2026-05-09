"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  Droplets,
  Plus,
  Search,
  Filter,
  User,
  Truck,
  Package,
  RefreshCw,
  ArrowRight,
  AlertCircle,
} from "lucide-react"

// Mock garrafon tracking data
const garrafones = {
  enBodega: {
    llenos: 150,
    vacios: 85,
  },
  conClientes: 420,
  enRuta: 65,
  total: 720,
}

const clientesConGarrafones = [
  { id: 1, name: "Maria Garcia", phone: "555-1234", garrafonesEnPrestamo: 8, ultimaCompra: "Hace 3 dias" },
  { id: 2, name: "Restaurant El Buen Sabor", phone: "555-5678", garrafonesEnPrestamo: 25, ultimaCompra: "Hoy" },
  { id: 3, name: "Hotel Costa Azul", phone: "555-9012", garrafonesEnPrestamo: 50, ultimaCompra: "Hace 1 semana" },
  { id: 4, name: "Juan Lopez", phone: "555-3456", garrafonesEnPrestamo: 5, ultimaCompra: "Hace 2 dias" },
  { id: 5, name: "Oficinas Reforma", phone: "555-7890", garrafonesEnPrestamo: 15, ultimaCompra: "Ayer" },
]

const movimientosGarrafones = [
  { type: "salida", customer: "Maria Garcia", quantity: 5, vacios: 3, date: "Hoy 10:30" },
  { type: "entrada", customer: "Juan Lopez", quantity: 0, vacios: 5, date: "Hoy 09:45" },
  { type: "salida", customer: "Hotel Costa Azul", quantity: 10, vacios: 8, date: "Hoy 08:15" },
  { type: "intercambio", customer: "Restaurant El Buen Sabor", quantity: 8, vacios: 8, date: "Ayer 17:30" },
]

export default function GarrafonesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [view, setView] = useState<"resumen" | "clientes" | "movimientos">("resumen")

  const filteredClientes = clientesConGarrafones.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  )

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Garrafones</h1>
            <p className="text-muted-foreground">Control de inventario circular de garrafones</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 h-10 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
              <RefreshCw className="h-4 w-4" />
              Intercambio
            </button>
            <button className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" />
              Registrar Movimiento
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Garrafones</span>
            </div>
            <p className="text-3xl font-bold">{garrafones.total}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-chart-2" />
              <span className="text-sm text-muted-foreground">En Bodega (Llenos)</span>
            </div>
            <p className="text-3xl font-bold text-chart-2">{garrafones.enBodega.llenos}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">En Bodega (Vacios)</span>
            </div>
            <p className="text-3xl font-bold">{garrafones.enBodega.vacios}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-chart-4" />
              <span className="text-sm text-muted-foreground">Con Clientes</span>
            </div>
            <p className="text-3xl font-bold text-chart-4">{garrafones.conClientes}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">En Ruta</span>
            </div>
            <p className="text-3xl font-bold text-warning">{garrafones.enRuta}</p>
          </div>
        </div>

        {/* Flow Visualization */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">Flujo de Garrafones</h2>
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2">
            {/* Bodega Vacios */}
            <div className="flex-1 min-w-[140px] bg-muted/50 rounded-lg p-4 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold">{garrafones.enBodega.vacios}</p>
              <p className="text-xs text-muted-foreground">Vacios en Bodega</p>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground shrink-0" />

            {/* Produccion */}
            <div className="flex-1 min-w-[140px] bg-primary/10 rounded-lg p-4 text-center">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground">Llenado / Produccion</p>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground shrink-0" />

            {/* Bodega Llenos */}
            <div className="flex-1 min-w-[140px] bg-chart-2/10 rounded-lg p-4 text-center">
              <Droplets className="h-8 w-8 mx-auto mb-2 text-chart-2" />
              <p className="font-semibold">{garrafones.enBodega.llenos}</p>
              <p className="text-xs text-muted-foreground">Llenos en Bodega</p>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground shrink-0" />

            {/* En Ruta */}
            <div className="flex-1 min-w-[140px] bg-warning/10 rounded-lg p-4 text-center">
              <Truck className="h-8 w-8 mx-auto mb-2 text-warning" />
              <p className="font-semibold">{garrafones.enRuta}</p>
              <p className="text-xs text-muted-foreground">En Ruta</p>
            </div>

            <ArrowRight className="h-6 w-6 text-muted-foreground shrink-0" />

            {/* Con Clientes */}
            <div className="flex-1 min-w-[140px] bg-chart-4/10 rounded-lg p-4 text-center">
              <User className="h-8 w-8 mx-auto mb-2 text-chart-4" />
              <p className="font-semibold">{garrafones.conClientes}</p>
              <p className="text-xs text-muted-foreground">Con Clientes</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {[
            { id: "resumen", label: "Resumen" },
            { id: "clientes", label: "Por Cliente" },
            { id: "movimientos", label: "Movimientos" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as typeof view)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                view === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content based on tab */}
        {view === "clientes" && (
          <div className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Telefono</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Garrafones en Prestamo</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ultima Compra</th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredClientes.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{cliente.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{cliente.phone}</td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                          <Droplets className="h-4 w-4" />
                          {cliente.garrafonesEnPrestamo}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{cliente.ultimaCompra}</td>
                      <td className="p-4 text-center">
                        <button className="text-sm text-primary hover:underline">Ver detalle</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === "movimientos" && (
          <div className="bg-card border border-border rounded-lg">
            <div className="divide-y divide-border">
              {movimientosGarrafones.map((mov, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      mov.type === "salida"
                        ? "bg-chart-4/10"
                        : mov.type === "entrada"
                        ? "bg-chart-2/10"
                        : "bg-primary/10"
                    }`}
                  >
                    {mov.type === "salida" ? (
                      <Truck className="h-6 w-6 text-chart-4" />
                    ) : mov.type === "entrada" ? (
                      <Package className="h-6 w-6 text-chart-2" />
                    ) : (
                      <RefreshCw className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{mov.customer}</p>
                    <p className="text-sm text-muted-foreground">
                      {mov.type === "salida" && `Entregados: ${mov.quantity} llenos | Recibidos: ${mov.vacios} vacios`}
                      {mov.type === "entrada" && `Recibidos: ${mov.vacios} vacios`}
                      {mov.type === "intercambio" && `Intercambio: ${mov.quantity} llenos por ${mov.vacios} vacios`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        mov.type === "salida"
                          ? "bg-chart-4/10 text-chart-4"
                          : mov.type === "entrada"
                          ? "bg-chart-2/10 text-chart-2"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {mov.type === "salida" ? "Salida" : mov.type === "entrada" ? "Entrada" : "Intercambio"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{mov.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "resumen" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clientes con mas garrafones */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Top Clientes con Garrafones</h3>
              </div>
              <div className="divide-y divide-border">
                {clientesConGarrafones
                  .sort((a, b) => b.garrafonesEnPrestamo - a.garrafonesEnPrestamo)
                  .slice(0, 5)
                  .map((cliente, idx) => (
                    <div key={cliente.id} className="p-4 flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{cliente.name}</p>
                      </div>
                      <span className="font-semibold text-primary">{cliente.garrafonesEnPrestamo}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Alertas */}
            <div className="bg-card border border-border rounded-lg">
              <div className="p-4 border-b border-border flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                <h3 className="font-semibold">Alertas</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Stock bajo de garrafones vacios</p>
                    <p className="text-xs text-muted-foreground">Solo quedan 85 garrafones vacios en bodega</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Cliente sin devolver garrafones</p>
                    <p className="text-xs text-muted-foreground">Hotel Costa Azul lleva 7 dias sin intercambio</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </POSLayout>
  )
}
