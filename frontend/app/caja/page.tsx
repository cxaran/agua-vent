"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  DollarSign,
  Banknote,
  CreditCard,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Calculator,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  User,
  Droplets,
  LogIn,
  LogOut,
} from "lucide-react"

// Mock: cajas disponibles
const cajasDisponibles = [
  { id: 1, nombre: "Caja 1", sucursal: "Matriz", tipo: "fija" },
  { id: 2, nombre: "Caja 2", sucursal: "Matriz", tipo: "fija" },
  { id: 3, nombre: "Caja Movil Ruta 1", sucursal: "Matriz", tipo: "movil" },
  { id: 4, nombre: "Caja Movil Ruta 2", sucursal: "Matriz", tipo: "movil" },
]

// Mock: sesion actual (null = cerrada)
const sesionActualMock = {
  id: 1,
  caja: { id: 1, nombre: "Caja 1", tipo: "fija" },
  usuario: { id: 1, nombre: "Carlos Martinez" },
  turno: "matutino",
  fechaApertura: "2024-02-15",
  horaApertura: "08:00",
  montoInicial: 2000,
  estado: "abierta" as const,
  ventas: {
    efectivo: 8500,
    tarjeta: 3200,
    transferencia: 950,
  },
  litrosVendidos: 1240,
  gastos: 450,
  retiros: 3000,
  depositos: 500,
}

const movimientos = [
  { id: 1, type: "venta", method: "efectivo", amount: 150, description: "Venta #V-048", litros: 100, time: "15:32" },
  { id: 2, type: "venta", method: "tarjeta", amount: 240, description: "Venta #V-047", litros: 160, time: "15:18" },
  { id: 3, type: "gasto", method: "efectivo", amount: -80, description: "Compra de limpieza", litros: 0, time: "14:45" },
  { id: 4, type: "venta", method: "efectivo", amount: 90, description: "Venta #V-046", litros: 60, time: "14:30" },
  { id: 5, type: "venta", method: "transferencia", amount: 300, description: "Venta #V-045", litros: 200, time: "14:15" },
  { id: 6, type: "retiro", method: "efectivo", amount: -1500, description: "Retiro a caja fuerte", litros: 0, time: "13:00" },
  { id: 7, type: "venta", method: "efectivo", amount: 180, description: "Venta #V-044", litros: 120, time: "12:45" },
  { id: 8, type: "deposito", method: "efectivo", amount: 500, description: "Deposito de cambio", litros: 0, time: "10:00" },
]

const denominations = [
  { value: 1000, label: "$1,000" },
  { value: 500, label: "$500" },
  { value: 200, label: "$200" },
  { value: 100, label: "$100" },
  { value: 50, label: "$50" },
  { value: 20, label: "$20" },
  { value: 10, label: "$10" },
  { value: 5, label: "$5" },
  { value: 2, label: "$2" },
  { value: 1, label: "$1" },
]

const turnos = [
  { id: "matutino", label: "Matutino (6:00 - 14:00)" },
  { id: "vespertino", label: "Vespertino (14:00 - 22:00)" },
  { id: "nocturno", label: "Nocturno (22:00 - 6:00)" },
]

export default function CajaPage() {
  const [sesionActual, setSesionActual] = useState<typeof sesionActualMock | null>(sesionActualMock)
  const [showCashCount, setShowCashCount] = useState(false)
  const [showMovement, setShowMovement] = useState<"gasto" | "retiro" | "deposito" | null>(null)
  const [showApertura, setShowApertura] = useState(false)
  const [cashCounts, setCashCounts] = useState<Record<number, number>>({})

  // Form states for apertura
  const [selectedCaja, setSelectedCaja] = useState<number | null>(null)
  const [selectedTurno, setSelectedTurno] = useState<string>("matutino")
  const [montoInicial, setMontoInicial] = useState<string>("2000")

  const totalVentas = sesionActual
    ? sesionActual.ventas.efectivo + sesionActual.ventas.tarjeta + sesionActual.ventas.transferencia
    : 0
  const efectivoEnCaja = sesionActual
    ? sesionActual.montoInicial +
      sesionActual.ventas.efectivo -
      sesionActual.gastos -
      sesionActual.retiros +
      sesionActual.depositos
    : 0

  const totalCounted = Object.entries(cashCounts).reduce(
    (sum, [denom, count]) => sum + Number(denom) * count,
    0
  )

  const updateCount = (denom: number, delta: number) => {
    setCashCounts((prev) => ({
      ...prev,
      [denom]: Math.max(0, (prev[denom] || 0) + delta),
    }))
  }

  const handleAbrirCaja = () => {
    // Mock: abrir caja
    const caja = cajasDisponibles.find(c => c.id === selectedCaja)
    if (caja) {
      setSesionActual({
        id: Date.now(),
        caja: { id: caja.id, nombre: caja.nombre, tipo: caja.tipo },
        usuario: { id: 1, nombre: "Carlos Martinez" },
        turno: selectedTurno,
        fechaApertura: new Date().toISOString().split("T")[0],
        horaApertura: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
        montoInicial: Number(montoInicial),
        estado: "abierta",
        ventas: { efectivo: 0, tarjeta: 0, transferencia: 0 },
        litrosVendidos: 0,
        gastos: 0,
        retiros: 0,
        depositos: 0,
      })
      setShowApertura(false)
    }
  }

  const handleCerrarCaja = () => {
    setSesionActual(null)
    setShowCashCount(false)
    setCashCounts({})
  }

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Control de Caja</h1>
            <p className="text-muted-foreground">Gestion de sesiones y movimientos de caja</p>
          </div>
          <div className="flex gap-3">
            {sesionActual ? (
              <>
                <button
                  onClick={() => setShowMovement("gasto")}
                  className="flex items-center gap-2 h-10 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                  Registrar Gasto
                </button>
                <button
                  onClick={() => setShowCashCount(true)}
                  className="flex items-center gap-2 h-10 px-4 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Caja
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowApertura(true)}
                className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Abrir Caja
              </button>
            )}
          </div>
        </div>

        {/* No Session State */}
        {!sesionActual && (
          <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-lg">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calculator className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No hay caja abierta</h2>
            <p className="text-muted-foreground mb-6">Abre una sesion de caja para comenzar a operar</p>
            <button
              onClick={() => setShowApertura(true)}
              className="flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <LogIn className="h-5 w-5" />
              Abrir Caja
            </button>
          </div>
        )}

        {/* Active Session */}
        {sesionActual && (
          <>
            {/* Status Banner */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-success/10 border border-success/30">
              <CheckCircle className="h-6 w-6 text-success shrink-0" />
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Caja</p>
                  <p className="font-semibold">{sesionActual.caja.nombre}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Usuario</p>
                  <p className="font-semibold">{sesionActual.usuario.nombre}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Turno</p>
                  <p className="font-semibold capitalize">{sesionActual.turno}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Apertura</p>
                  <p className="font-semibold">{sesionActual.horaApertura}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fondo Inicial</p>
                  <p className="font-semibold">${sesionActual.montoInicial.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-chart-2" />
                  <span className="text-xs text-muted-foreground">Total Ventas</span>
                </div>
                <p className="text-xl font-bold">${totalVentas.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">Litros Vendidos</span>
                </div>
                <p className="text-xl font-bold text-primary">{sesionActual.litrosVendidos.toLocaleString()} L</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="h-5 w-5 text-success" />
                  <span className="text-xs text-muted-foreground">Efectivo</span>
                </div>
                <p className="text-xl font-bold">${sesionActual.ventas.efectivo.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-chart-3" />
                  <span className="text-xs text-muted-foreground">Tarjeta</span>
                </div>
                <p className="text-xl font-bold">${sesionActual.ventas.tarjeta.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-5 w-5 text-chart-4" />
                  <span className="text-xs text-muted-foreground">Transfer.</span>
                </div>
                <p className="text-xl font-bold">${sesionActual.ventas.transferencia.toLocaleString()}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="h-5 w-5 text-destructive" />
                  <span className="text-xs text-muted-foreground">Gastos/Retiros</span>
                </div>
                <p className="text-xl font-bold text-destructive">
                  -${(sesionActual.gastos + sesionActual.retiros).toLocaleString()}
                </p>
              </div>
              <div className="bg-card border border-primary rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span className="text-xs text-muted-foreground">En Caja</span>
                </div>
                <p className="text-xl font-bold text-primary">${efectivoEnCaja.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Movimientos */}
              <div className="lg:col-span-2 bg-card border border-border rounded-lg">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold">Movimientos de la Sesion</h2>
                  <button className="text-sm text-primary hover:underline">Ver completo</button>
                </div>
                <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                  {movimientos.map((mov) => (
                    <div key={mov.id} className="p-4 flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          mov.type === "venta"
                            ? "bg-success/10"
                            : mov.type === "deposito"
                            ? "bg-chart-2/10"
                            : "bg-destructive/10"
                        }`}
                      >
                        {mov.type === "venta" || mov.type === "deposito" ? (
                          <ArrowUpRight
                            className={`h-5 w-5 ${mov.type === "venta" ? "text-success" : "text-chart-2"}`}
                          />
                        ) : (
                          <ArrowDownRight className="h-5 w-5 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{mov.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{mov.time}</span>
                          <span>|</span>
                          <span className="capitalize">{mov.method}</span>
                          {mov.litros > 0 && (
                            <>
                              <span>|</span>
                              <Droplets className="h-3 w-3 text-primary" />
                              <span className="text-primary">{mov.litros}L</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p
                        className={`font-semibold ${
                          mov.amount > 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {mov.amount > 0 ? "+" : ""}${Math.abs(mov.amount).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Acciones de Caja</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowMovement("deposito")}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-success/10 hover:bg-success/20 transition-colors"
                    >
                      <ArrowUpRight className="h-5 w-5 text-success" />
                      <span className="font-medium">Deposito de Efectivo</span>
                    </button>
                    <button
                      onClick={() => setShowMovement("retiro")}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-warning/10 hover:bg-warning/20 transition-colors"
                    >
                      <ArrowDownRight className="h-5 w-5 text-warning" />
                      <span className="font-medium">Retiro de Efectivo</span>
                    </button>
                    <button
                      onClick={() => setShowMovement("gasto")}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors"
                    >
                      <Minus className="h-5 w-5 text-destructive" />
                      <span className="font-medium">Registrar Gasto</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium">Imprimir Corte</span>
                    </button>
                  </div>
                </div>

                {/* Resumen por Metodo */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Ventas por Metodo</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Efectivo", value: sesionActual.ventas.efectivo, color: "bg-success" },
                      { label: "Tarjeta", value: sesionActual.ventas.tarjeta, color: "bg-chart-3" },
                      { label: "Transferencia", value: sesionActual.ventas.transferencia, color: "bg-chart-4" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{item.label}</span>
                          <span className="font-medium">${item.value.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full`}
                            style={{ width: `${totalVentas > 0 ? (item.value / totalVentas) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Control Cruzado */}
                <div className="bg-card border border-primary/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Control Cruzado
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Litros vendidos:</span>
                      <span className="font-medium">{sesionActual.litrosVendidos.toLocaleString()} L</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Agua consumida (estimado):</span>
                      <span className="font-medium">{(sesionActual.litrosVendidos * 1.02).toLocaleString()} L</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Rendimiento:</span>
                      <span className="font-medium text-success">98%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modal Apertura de Caja */}
        {showApertura && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold">Abrir Caja</h2>
                  <p className="text-sm text-muted-foreground">Iniciar nueva sesion de caja</p>
                </div>
                <button
                  onClick={() => setShowApertura(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Usuario */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Usuario</p>
                    <p className="font-medium">Carlos Martinez</p>
                  </div>
                </div>

                {/* Seleccionar Caja */}
                <div>
                  <label className="block text-sm font-medium mb-2">Seleccionar Caja</label>
                  <div className="grid grid-cols-2 gap-2">
                    {cajasDisponibles.map((caja) => (
                      <button
                        key={caja.id}
                        onClick={() => setSelectedCaja(caja.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedCaja === caja.id
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p className="font-medium text-sm">{caja.nombre}</p>
                        <p className="text-xs text-muted-foreground capitalize">{caja.tipo}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Turno */}
                <div>
                  <label className="block text-sm font-medium mb-2">Turno</label>
                  <select
                    value={selectedTurno}
                    onChange={(e) => setSelectedTurno(e.target.value)}
                    className="w-full h-10 px-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {turnos.map((turno) => (
                      <option key={turno.id} value={turno.id}>{turno.label}</option>
                    ))}
                  </select>
                </div>

                {/* Monto Inicial */}
                <div>
                  <label className="block text-sm font-medium mb-2">Fondo Inicial</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={montoInicial}
                      onChange={(e) => setMontoInicial(e.target.value)}
                      placeholder="0.00"
                      className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowApertura(false)}
                    className="flex-1 h-10 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAbrirCaja}
                    disabled={!selectedCaja}
                    className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Abrir Caja
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cash Count Modal (Cierre) */}
        {showCashCount && sesionActual && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h2 className="text-lg font-semibold">Cierre de Caja - Arqueo</h2>
                  <p className="text-sm text-muted-foreground">{sesionActual.caja.nombre} | {sesionActual.usuario.nombre}</p>
                </div>
                <button
                  onClick={() => setShowCashCount(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Resumen de la Sesion */}
                <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ventas totales:</span>
                    <span className="font-bold">${totalVentas.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Litros vendidos:</span>
                    <span className="font-bold text-primary">{sesionActual.litrosVendidos.toLocaleString()} L</span>
                  </div>
                </div>

                {/* Denominations */}
                <div>
                  <p className="text-sm font-medium mb-3">Conteo de Efectivo</p>
                  <div className="space-y-2">
                    {denominations.map((d) => (
                      <div
                        key={d.value}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="font-medium">{d.label}</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateCount(d.value, -1)}
                            className="h-8 w-8 rounded bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-mono">{cashCounts[d.value] || 0}</span>
                          <button
                            onClick={() => updateCount(d.value, 1)}
                            className="h-8 w-8 rounded bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <span className="w-20 text-right font-medium">
                            ${((cashCounts[d.value] || 0) * d.value).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Total Contado:</span>
                    <span className="font-bold text-lg">${totalCounted.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Esperado en Caja:</span>
                    <span className="font-medium">${efectivoEnCaja.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diferencia:</span>
                    <span
                      className={`font-bold ${
                        totalCounted - efectivoEnCaja === 0
                          ? "text-success"
                          : totalCounted - efectivoEnCaja > 0
                          ? "text-chart-2"
                          : "text-destructive"
                      }`}
                    >
                      {totalCounted - efectivoEnCaja >= 0 ? "+" : ""}${(totalCounted - efectivoEnCaja).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCashCount(false)}
                    className="flex-1 h-10 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCerrarCaja}
                    className="flex-1 h-10 bg-destructive text-destructive-foreground rounded-lg font-medium hover:bg-destructive/90 transition-colors"
                  >
                    Confirmar Cierre
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Movement Modal */}
        {showMovement && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold capitalize">
                  {showMovement === "gasto"
                    ? "Registrar Gasto"
                    : showMovement === "retiro"
                    ? "Retiro de Efectivo"
                    : "Deposito de Efectivo"}
                </h2>
                <button
                  onClick={() => setShowMovement(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Monto</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Descripcion</label>
                  <input
                    type="text"
                    placeholder={
                      showMovement === "gasto"
                        ? "Ej: Compra de material de limpieza"
                        : showMovement === "retiro"
                        ? "Ej: Retiro a caja fuerte"
                        : "Ej: Deposito de cambio"
                    }
                    className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowMovement(null)}
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
