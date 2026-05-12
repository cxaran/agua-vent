"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

// Mock inventory data
const inventoryItems = [
  { id: 1, name: "Garrafon 20L Nuevo", sku: "GAR-20-N", stock: 45, minStock: 20, price: 80, category: "Garrafones" },
  { id: 2, name: "Garrafon 20L Usado", sku: "GAR-20-U", stock: 120, minStock: 50, price: 30, category: "Garrafones" },
  { id: 3, name: "Garrafon 10L Nuevo", sku: "GAR-10-N", stock: 25, minStock: 15, price: 50, category: "Garrafones" },
  { id: 4, name: "Botella 1L", sku: "BOT-1L", stock: 200, minStock: 100, price: 10, category: "Botellas" },
  { id: 5, name: "Botella 500ml", sku: "BOT-500", stock: 350, minStock: 150, price: 7, category: "Botellas" },
  { id: 6, name: "Tapa Azul Estandar", sku: "TAP-AZ", stock: 12, minStock: 50, price: 3, category: "Accesorios" },
  { id: 7, name: "Etiqueta Personalizada", sku: "ETQ-PER", stock: 8, minStock: 100, price: 1, category: "Accesorios" },
  { id: 8, name: "Bolsa Termica 5L", sku: "BOL-5L", stock: 30, minStock: 20, price: 15, category: "Accesorios" },
  { id: 9, name: "Hielo 5kg", sku: "HIE-5K", stock: 50, minStock: 30, price: 25, category: "Otros" },
  { id: 10, name: "Dispensador Agua", sku: "DIS-AG", stock: 8, minStock: 5, price: 250, category: "Equipos" },
]

const categories = ["Todos", "Garrafones", "Botellas", "Accesorios", "Equipos", "Otros"]

const movements = [
  { type: "entrada", product: "Garrafon 20L Nuevo", quantity: 50, date: "Hoy 10:30", user: "Carlos M." },
  { type: "salida", product: "Botella 1L", quantity: 24, date: "Hoy 09:15", user: "Ana R." },
  { type: "entrada", product: "Tapa Azul Estandar", quantity: 100, date: "Ayer 16:45", user: "Carlos M." },
  { type: "salida", product: "Garrafon 20L Usado", quantity: 15, date: "Ayer 14:20", user: "Pedro S." },
]

export default function InventarioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [showLowStock, setShowLowStock] = useState(false)

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory
    const matchesLowStock = !showLowStock || item.stock <= item.minStock
    return matchesSearch && matchesCategory && matchesLowStock
  })

  const totalValue = inventoryItems.reduce((sum, item) => sum + item.stock * item.price, 0)
  const lowStockCount = inventoryItems.filter((item) => item.stock <= item.minStock).length

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Inventario</h1>
            <p className="text-muted-foreground">Gestiona tu inventario de productos</p>
          </div>
          <button className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Agregar Producto
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Productos</p>
            <p className="text-2xl font-bold">{inventoryItems.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Unidades en Stock</p>
            <p className="text-2xl font-bold">
              {inventoryItems.reduce((sum, item) => sum + item.stock, 0)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Valor del Inventario</p>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">Stock Bajo</p>
              {lowStockCount > 0 && (
                <AlertTriangle className="h-4 w-4 text-warning" />
              )}
            </div>
            <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Inventory Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 px-3 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowLowStock(!showLowStock)}
                className={`flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-colors ${
                  showLowStock
                    ? "bg-warning text-warning-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                Stock Bajo
              </button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Producto</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">SKU</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Stock</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Min.</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Precio</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Estado</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm font-mono text-muted-foreground">{item.sku}</td>
                        <td className="p-4 text-center font-semibold">{item.stock}</td>
                        <td className="p-4 text-center text-muted-foreground">{item.minStock}</td>
                        <td className="p-4 text-right font-medium">${item.price}</td>
                        <td className="p-4 text-center">
                          {item.stock <= item.minStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
                              <AlertTriangle className="h-3 w-3" />
                              Bajo
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                              OK
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Movements */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Movimientos Recientes</h2>
            </div>
            <div className="divide-y divide-border">
              {movements.map((mov, idx) => (
                <div key={idx} className="p-4 flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      mov.type === "entrada" ? "bg-success/10" : "bg-destructive/10"
                    }`}
                  >
                    {mov.type === "entrada" ? (
                      <TrendingUp className="h-5 w-5 text-success" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{mov.product}</p>
                    <p className="text-xs text-muted-foreground">
                      {mov.type === "entrada" ? "+" : "-"}{mov.quantity} unidades
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{mov.date}</p>
                    <p className="text-xs text-muted-foreground">{mov.user}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-border">
              <button className="w-full text-center text-sm text-primary hover:underline">
                Ver todos los movimientos
              </button>
            </div>
          </div>
        </div>
      </div>
    </POSLayout>
  )
}
