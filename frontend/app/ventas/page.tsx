"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  Droplets,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Search,
  User,
  FileText,
  Package,
  RefreshCw,
  Clock,
  AlertCircle,
} from "lucide-react"

// Presentaciones de agua (el producto real son los LITROS)
const presentaciones = [
  { id: 1, nombre: "Garrafon 20L", litros: 20, precio: 30, requiereGarrafon: true, categoria: "garrafones" },
  { id: 2, nombre: "Garrafon 20L + Envase", litros: 20, precio: 130, requiereGarrafon: false, incluyeEnvase: true, categoria: "garrafones" },
  { id: 3, nombre: "Rellenado 20L", litros: 20, precio: 15, requiereGarrafon: true, esRellenado: true, categoria: "servicios" },
  { id: 4, nombre: "Garrafon 10L", litros: 10, precio: 18, requiereGarrafon: true, categoria: "garrafones" },
  { id: 5, nombre: "Botella 1L", litros: 1, precio: 10, categoria: "botellas" },
  { id: 6, nombre: "Botella 500ml", litros: 0.5, precio: 7, categoria: "botellas" },
  { id: 7, nombre: "Paquete 12 Botellas 1L", litros: 12, precio: 100, categoria: "paquetes" },
  { id: 8, nombre: "Hielo 5kg", litros: 0, precio: 25, categoria: "otros", esHielo: true },
]

const categorias = [
  { id: "todos", label: "Todos" },
  { id: "garrafones", label: "Garrafones" },
  { id: "botellas", label: "Botellas" },
  { id: "servicios", label: "Servicios" },
  { id: "paquetes", label: "Paquetes" },
  { id: "otros", label: "Otros" },
]

type CartItem = {
  id: number
  nombre: string
  litros: number
  precio: number
  cantidad: number
  requiereGarrafon?: boolean
  garrafonesRecibidos: number
}

// Mock: sesion de caja activa
const sesionCaja = {
  activa: true,
  caja: "Caja 1",
  usuario: "Carlos Martinez",
  turno: "Matutino",
  apertura: "08:00",
}

// Mock: nivel de deposito
const depositoActual = {
  nombre: "Tanque Principal",
  nivelActual: 7500,
  capacidadTotal: 10000,
}

export default function VentasPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)

  const filteredProducts = presentaciones.filter((p) => {
    const matchesCategory = selectedCategory === "todos" || p.categoria === selectedCategory
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: (typeof presentaciones)[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          nombre: product.nombre,
          litros: product.litros,
          precio: product.precio,
          cantidad: 1,
          requiereGarrafon: product.requiereGarrafon,
          garrafonesRecibidos: 0,
        },
      ]
    })
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, cantidad: Math.max(0, item.cantidad + delta) } : item
        )
        .filter((item) => item.cantidad > 0)
    )
  }

  const updateGarrafonesRecibidos = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, garrafonesRecibidos: Math.max(0, Math.min(item.cantidad, item.garrafonesRecibidos + delta)) }
          : item
      )
    )
  }

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // Calculos
  const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
  const totalLitros = cart.reduce((sum, item) => sum + item.litros * item.cantidad, 0)
  const totalGarrafonesEntregados = cart.filter(i => i.requiereGarrafon).reduce((sum, item) => sum + item.cantidad, 0)
  const totalGarrafonesRecibidos = cart.reduce((sum, item) => sum + item.garrafonesRecibidos, 0)
  const tax = 0 // Agua generalmente exenta de IVA en Mexico
  const total = subtotal + tax

  const clearSale = () => {
    setCart([])
    setSelectedCustomer(null)
    setPaymentMethod(null)
  }

  const nivelDeposito = Math.round((depositoActual.nivelActual / depositoActual.capacidadTotal) * 100)

  return (
    <POSLayout>
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Products Section */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Session Info Bar */}
          <div className="flex items-center justify-between gap-4 mb-4 p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              {sesionCaja.activa ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="font-medium">{sesionCaja.caja}</span>
                  </div>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-muted-foreground">{sesionCaja.usuario}</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="text-muted-foreground">{sesionCaja.turno}</span>
                </>
              ) : (
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="h-4 w-4" />
                  <span>Caja no abierta</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Droplets className="h-4 w-4 text-primary" />
              <span>{depositoActual.nombre}:</span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${nivelDeposito > 50 ? "bg-success" : nivelDeposito > 20 ? "bg-warning" : "bg-destructive"}`}
                  style={{ width: `${nivelDeposito}%` }}
                />
              </div>
              <span className="font-medium">{nivelDeposito}%</span>
            </div>
          </div>

          {/* Search and Categories */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar presentacion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={!sesionCaja.activa}
                  className="bg-card border border-border rounded-lg p-4 text-left hover:border-primary transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                    {product.categoria === "garrafones" ? (
                      <Droplets className="h-6 w-6 text-primary" />
                    ) : product.categoria === "servicios" ? (
                      <RefreshCw className="h-6 w-6 text-primary" />
                    ) : (
                      <Package className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <p className="font-medium text-sm line-clamp-2">{product.nombre}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-lg font-bold text-primary">${product.precio}</p>
                    {product.litros > 0 && (
                      <span className="text-xs text-muted-foreground">{product.litros}L</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-[420px] bg-card border border-border rounded-lg flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Venta Actual</h2>
              {cart.length > 0 && (
                <button
                  onClick={clearSale}
                  className="text-sm text-destructive hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Customer Selection */}
            <button className="mt-3 w-full flex items-center gap-3 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {selectedCustomer || "Seleccionar cliente (opcional)"}
              </span>
            </button>
          </div>

          {/* Litros Counter */}
          <div className="px-4 py-3 bg-primary/5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Litros en esta venta:</span>
            </div>
            <span className="text-xl font-bold text-primary">{totalLitros} L</span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Droplets className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">Carrito vacio</p>
                <p className="text-xs">Selecciona presentaciones para agregar</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-secondary rounded-lg space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        ${item.precio} x {item.cantidad} = ${item.precio * item.cantidad}
                      </p>
                      {item.litros > 0 && (
                        <p className="text-xs text-primary">{item.litros * item.cantidad} litros</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="h-8 w-8 rounded bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="h-8 w-8 rounded bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 rounded bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  {/* Garrafones recibidos (intercambio) */}
                  {item.requiereGarrafon && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">Garrafones vacios recibidos:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateGarrafonesRecibidos(item.id, -1)}
                          className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium">{item.garrafonesRecibidos}</span>
                        <button
                          onClick={() => updateGarrafonesRecibidos(item.id, 1)}
                          className="h-6 w-6 rounded bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t border-border space-y-4">
            {/* Garrafon Summary */}
            {totalGarrafonesEntregados > 0 && (
              <div className="p-3 bg-primary/5 rounded-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Garrafones a entregar:</span>
                  <span className="font-medium">{totalGarrafonesEntregados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Garrafones vacios recibidos:</span>
                  <span className="font-medium">{totalGarrafonesRecibidos}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Balance garrafones:</span>
                  <span className={`font-bold ${totalGarrafonesEntregados - totalGarrafonesRecibidos > 0 ? "text-warning" : "text-success"}`}>
                    {totalGarrafonesEntregados - totalGarrafonesRecibidos > 0 ? "+" : ""}
                    {totalGarrafonesEntregados - totalGarrafonesRecibidos} en prestamo
                  </span>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "efectivo", label: "Efectivo", icon: Banknote },
                { id: "tarjeta", label: "Tarjeta", icon: CreditCard },
                { id: "transferencia", label: "Transfer.", icon: Smartphone },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs font-medium transition-colors ${
                    paymentMethod === method.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  <method.icon className="h-5 w-5" />
                  {method.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 h-12 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                <FileText className="h-5 w-5" />
                Facturar
              </button>
              <button
                disabled={cart.length === 0 || !sesionCaja.activa}
                className="flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cobrar ${total.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </POSLayout>
  )
}
