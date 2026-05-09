"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  Droplets,
  Plus,
  Minus,
  AlertTriangle,
  RefreshCw,
  Wrench,
  TrendingUp,
  TrendingDown,
  Calendar,
  X,
} from "lucide-react"

// Mock depositos data
const depositos = [
  {
    id: 1,
    nombre: "Cisterna Principal",
    tipo: "cisterna",
    capacidadTotal: 10000,
    nivelActual: 7500,
    estado: "lleno",
    ultimaLimpieza: "2024-01-15",
    proximaLimpieza: "2024-04-15",
  },
  {
    id: 2,
    nombre: "Tanque Elevado 1",
    tipo: "tanque",
    capacidadTotal: 5000,
    nivelActual: 2100,
    estado: "medio",
    ultimaLimpieza: "2024-02-01",
    proximaLimpieza: "2024-05-01",
  },
  {
    id: 3,
    nombre: "Tanque Elevado 2",
    tipo: "tanque",
    capacidadTotal: 5000,
    nivelActual: 800,
    estado: "bajo",
    ultimaLimpieza: "2024-01-20",
    proximaLimpieza: "2024-04-20",
  },
  {
    id: 4,
    nombre: "Tinaco Produccion",
    tipo: "tinaco",
    capacidadTotal: 2500,
    nivelActual: 250,
    estado: "critico",
    ultimaLimpieza: "2024-02-10",
    proximaLimpieza: "2024-05-10",
  },
]

const movimientosAgua = [
  { tipo: "produccion", litros: 500, deposito: "Cisterna Principal", fecha: "Hoy 14:30" },
  { tipo: "venta", litros: -200, deposito: "Tanque Elevado 1", fecha: "Hoy 14:15" },
  { tipo: "venta", litros: -80, deposito: "Tanque Elevado 1", fecha: "Hoy 13:45" },
  { tipo: "trasvase", litros: 1000, deposito: "Tanque Elevado 2", desde: "Cisterna Principal", fecha: "Hoy 12:00" },
  { tipo: "merma", litros: -15, deposito: "Tinaco Produccion", fecha: "Hoy 10:30" },
  { tipo: "produccion", litros: 800, deposito: "Cisterna Principal", fecha: "Ayer 16:00" },
]

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "lleno":
      return "bg-success text-success"
    case "medio":
      return "bg-chart-2 text-chart-2"
    case "bajo":
      return "bg-warning text-warning"
    case "critico":
      return "bg-destructive text-destructive"
    case "mantenimiento":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getNivelPorcentaje = (actual: number, total: number) => {
  return Math.round((actual / total) * 100)
}

export default function DepositosPage() {
  const [showModal, setShowModal] = useState<"produccion" | "trasvase" | "merma" | "mantenimiento" | null>(null)

  const totalCapacidad = depositos.reduce((sum, d) => sum + d.capacidadTotal, 0)
  const totalActual = depositos.reduce((sum, d) => sum + d.nivelActual, 0)

  // Stats del dia (mock)
  const litrosProducidos = 1300
  const litrosVendidos = 980
  const litrosMerma = 15
  const rendimiento = Math.round((litrosVendidos / litrosProducidos) * 100)

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Depositos de Agua</h1>
            <p className="text-muted-foreground">Control de cisternas, tanques y niveles de agua</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal("trasvase")}
              className="flex items-center gap-2 h-10 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Trasvase
            </button>
            <button
              onClick={() => setShowModal("produccion")}
              className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Registrar Produccion
            </button>
          </div>
        </div>

        {/* KPIs de Agua */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total en Stock</span>
            </div>
            <p className="text-2xl font-bold">{totalActual.toLocaleString()} L</p>
            <p className="text-xs text-muted-foreground">de {totalCapacidad.toLocaleString()} L capacidad</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">Producidos Hoy</span>
            </div>
            <p className="text-2xl font-bold text-success">{litrosProducidos.toLocaleString()} L</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-chart-4" />
              <span className="text-sm text-muted-foreground">Vendidos Hoy</span>
            </div>
            <p className="text-2xl font-bold text-chart-4">{litrosVendidos.toLocaleString()} L</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">Merma</span>
            </div>
            <p className="text-2xl font-bold text-warning">{litrosMerma} L</p>
          </div>
          <div className="bg-card border border-primary rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Rendimiento</span>
            </div>
            <p className="text-2xl font-bold text-primary">{rendimiento}%</p>
          </div>
        </div>

        {/* Depositos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {depositos.map((deposito) => {
            const porcentaje = getNivelPorcentaje(deposito.nivelActual, deposito.capacidadTotal)
            const colorClasses = getEstadoColor(deposito.estado)

            return (
              <div key={deposito.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${colorClasses.split(" ")[0]}/10 flex items-center justify-center`}>
                      <Droplets className={`h-5 w-5 ${colorClasses.split(" ")[1]}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{deposito.nombre}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{deposito.tipo}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses.split(" ")[0]}/10 ${colorClasses.split(" ")[1]} capitalize`}>
                    {deposito.estado}
                  </span>
                </div>

                <div className="p-4">
                  {/* Nivel Visual */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Nivel actual</span>
                      <span className="font-semibold">{deposito.nivelActual.toLocaleString()} L / {deposito.capacidadTotal.toLocaleString()} L</span>
                    </div>
                    <div className="h-8 bg-muted rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full ${colorClasses.split(" ")[0]} transition-all duration-500`}
                        style={{ width: `${porcentaje}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground mix-blend-difference">
                        {porcentaje}%
                      </span>
                    </div>
                  </div>

                  {/* Info de Mantenimiento */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      <span>Ultima limpieza: {deposito.ultimaLimpieza}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Proxima: {deposito.proximaLimpieza}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-t border-border flex gap-2">
                  <button
                    onClick={() => setShowModal("produccion")}
                    className="flex-1 flex items-center justify-center gap-2 h-9 bg-success/10 text-success rounded-lg text-sm font-medium hover:bg-success/20 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Entrada
                  </button>
                  <button
                    onClick={() => setShowModal("merma")}
                    className="flex-1 flex items-center justify-center gap-2 h-9 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                    Merma
                  </button>
                  <button
                    onClick={() => setShowModal("mantenimiento")}
                    className="flex-1 flex items-center justify-center gap-2 h-9 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                  >
                    <Wrench className="h-4 w-4" />
                    Manten.
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Movimientos de Agua */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">Movimientos de Agua</h2>
            <button className="text-sm text-primary hover:underline">Ver historial</button>
          </div>
          <div className="divide-y divide-border">
            {movimientosAgua.map((mov, idx) => (
              <div key={idx} className="p-4 flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    mov.tipo === "produccion"
                      ? "bg-success/10"
                      : mov.tipo === "venta"
                      ? "bg-chart-4/10"
                      : mov.tipo === "trasvase"
                      ? "bg-primary/10"
                      : "bg-warning/10"
                  }`}
                >
                  {mov.tipo === "produccion" ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : mov.tipo === "venta" ? (
                    <TrendingDown className="h-5 w-5 text-chart-4" />
                  ) : mov.tipo === "trasvase" ? (
                    <RefreshCw className="h-5 w-5 text-primary" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium capitalize">{mov.tipo}</p>
                  <p className="text-sm text-muted-foreground">
                    {mov.deposito}
                    {mov.tipo === "trasvase" && mov.desde && ` (desde ${mov.desde})`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${mov.litros > 0 ? "text-success" : "text-destructive"}`}>
                    {mov.litros > 0 ? "+" : ""}{mov.litros.toLocaleString()} L
                  </p>
                  <p className="text-xs text-muted-foreground">{mov.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h2 className="font-semibold">Alertas de Depositos</h2>
          </div>
          <div className="p-4 space-y-3">
            {depositos.filter(d => d.estado === "critico" || d.estado === "bajo").map((d) => (
              <div
                key={d.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  d.estado === "critico" ? "bg-destructive/10" : "bg-warning/10"
                }`}
              >
                <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${d.estado === "critico" ? "text-destructive" : "text-warning"}`} />
                <div>
                  <p className="font-medium text-sm">
                    {d.estado === "critico" ? "Nivel critico" : "Nivel bajo"}: {d.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Solo {d.nivelActual.toLocaleString()} L ({getNivelPorcentaje(d.nivelActual, d.capacidadTotal)}% de capacidad)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Registro */}
        {showModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">
                  {showModal === "produccion" && "Registrar Produccion"}
                  {showModal === "trasvase" && "Trasvase entre Depositos"}
                  {showModal === "merma" && "Registrar Merma"}
                  {showModal === "mantenimiento" && "Registrar Mantenimiento"}
                </h2>
                <button
                  onClick={() => setShowModal(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {showModal === "trasvase" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Deposito Origen</label>
                      <select className="w-full h-10 px-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        {depositos.map((d) => (
                          <option key={d.id} value={d.id}>{d.nombre} ({d.nivelActual.toLocaleString()} L)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Deposito Destino</label>
                      <select className="w-full h-10 px-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        {depositos.map((d) => (
                          <option key={d.id} value={d.id}>{d.nombre}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {(showModal === "produccion" || showModal === "merma") && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Deposito</label>
                    <select className="w-full h-10 px-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      {depositos.map((d) => (
                        <option key={d.id} value={d.id}>{d.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                {showModal !== "mantenimiento" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Cantidad (Litros)</label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}

                {showModal === "mantenimiento" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Deposito</label>
                      <select className="w-full h-10 px-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        {depositos.map((d) => (
                          <option key={d.id} value={d.id}>{d.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Mantenimiento</label>
                      <select className="w-full h-10 px-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="limpieza">Limpieza</option>
                        <option value="sanitizacion">Sanitizacion</option>
                        <option value="reparacion">Reparacion</option>
                        <option value="inspeccion">Inspeccion</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Notas (opcional)</label>
                  <textarea
                    placeholder="Observaciones..."
                    rows={2}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowModal(null)}
                    className="flex-1 h-10 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </POSLayout>
  )
}
