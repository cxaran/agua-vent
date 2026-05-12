"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  User,
  Plus,
  Search,
  Phone,
  MapPin,
  Mail,
  Calendar,
  DollarSign,
  Droplets,
  Star,
  Edit,
  Eye,
  AlertTriangle,
  X,
  Building,
} from "lucide-react"

// Mock customer data
const customers = [
  {
    id: 1,
    name: "Maria Garcia",
    type: "individual",
    phone: "555-1234",
    email: "maria@email.com",
    address: "Calle Principal 123, Col. Centro",
    totalCompras: 4500,
    garrafonesEnPrestamo: 8,
    ultimaCompra: "2024-01-15",
    frecuencia: "semanal",
    credito: 0,
    limiteCredito: 500,
    rfc: "",
  },
  {
    id: 2,
    name: "Restaurant El Buen Sabor",
    type: "empresa",
    phone: "555-5678",
    email: "contacto@elbuensabor.com",
    address: "Av. Reforma 456, Col. Juarez",
    totalCompras: 25000,
    garrafonesEnPrestamo: 25,
    ultimaCompra: "2024-01-18",
    frecuencia: "diario",
    credito: 1200,
    limiteCredito: 5000,
    rfc: "REB901201ABC",
  },
  {
    id: 3,
    name: "Hotel Costa Azul",
    type: "empresa",
    phone: "555-9012",
    email: "compras@costaazul.com",
    address: "Blvd. Costero 789, Zona Hotelera",
    totalCompras: 85000,
    garrafonesEnPrestamo: 50,
    ultimaCompra: "2024-01-10",
    frecuencia: "diario",
    credito: 3500,
    limiteCredito: 10000,
    rfc: "HCA850315XYZ",
  },
  {
    id: 4,
    name: "Juan Lopez",
    type: "individual",
    phone: "555-3456",
    email: "",
    address: "Privada Los Pinos 45",
    totalCompras: 1200,
    garrafonesEnPrestamo: 5,
    ultimaCompra: "2024-01-16",
    frecuencia: "quincenal",
    credito: 0,
    limiteCredito: 300,
    rfc: "",
  },
  {
    id: 5,
    name: "Oficinas Reforma",
    type: "empresa",
    phone: "555-7890",
    email: "admin@oficinasreforma.com",
    address: "Torre Reforma Piso 12",
    totalCompras: 15000,
    garrafonesEnPrestamo: 15,
    ultimaCompra: "2024-01-17",
    frecuencia: "semanal",
    credito: 800,
    limiteCredito: 3000,
    rfc: "ORE920610DEF",
  },
]

const frecuenciaLabels: Record<string, string> = {
  diario: "Diario",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
  esporadico: "Esporadico",
}

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"todos" | "individual" | "empresa">("todos")
  const [showWithCredit, setShowWithCredit] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof customers)[0] | null>(null)

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "todos" || c.type === filterType
    const matchesCredit = !showWithCredit || c.credito > 0
    return matchesSearch && matchesType && matchesCredit
  })

  const totalClientes = customers.length
  const totalCredito = customers.reduce((sum, c) => sum + c.credito, 0)
  const clientesConCredito = customers.filter((c) => c.credito > 0).length

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gestion de clientes y CRM</p>
          </div>
          <button className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Clientes</p>
            <p className="text-2xl font-bold">{totalClientes}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Empresas</p>
            <p className="text-2xl font-bold">{customers.filter((c) => c.type === "empresa").length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Clientes con Credito</p>
            <p className="text-2xl font-bold text-warning">{clientesConCredito}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total por Cobrar</p>
            <p className="text-2xl font-bold text-destructive">${totalCredito.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre, telefono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            {(["todos", "individual", "empresa"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {type === "todos" ? "Todos" : type === "individual" ? "Individuales" : "Empresas"}
              </button>
            ))}
            <button
              onClick={() => setShowWithCredit(!showWithCredit)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showWithCredit
                  ? "bg-warning text-warning-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Con Credito
            </button>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contacto</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Garrafones</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Frecuencia</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total Compras</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Credito</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          customer.type === "empresa" ? "bg-chart-2/10" : "bg-primary/10"
                        }`}
                      >
                        {customer.type === "empresa" ? (
                          <Building className="h-5 w-5 text-chart-2" />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.type === "empresa" ? "Empresa" : "Individual"}
                          {customer.rfc && ` | RFC: ${customer.rfc}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {customer.phone}
                      </p>
                      {customer.email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Droplets className="h-3 w-3" />
                      {customer.garrafonesEnPrestamo}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm">{frecuenciaLabels[customer.frecuencia]}</span>
                  </td>
                  <td className="p-4 text-right font-medium">${customer.totalCompras.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    {customer.credito > 0 ? (
                      <span className="text-destructive font-medium">
                        ${customer.credito.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-success">$0</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Detail Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      selectedCustomer.type === "empresa" ? "bg-chart-2/10" : "bg-primary/10"
                    }`}
                  >
                    {selectedCustomer.type === "empresa" ? (
                      <Building className="h-6 w-6 text-chart-2" />
                    ) : (
                      <User className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedCustomer.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedCustomer.type === "empresa" ? "Empresa" : "Cliente Individual"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{selectedCustomer.address}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {selectedCustomer.rfc && (
                      <div>
                        <p className="text-xs text-muted-foreground">RFC</p>
                        <p className="font-mono">{selectedCustomer.rfc}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Frecuencia de Compra</p>
                      <p>{frecuenciaLabels[selectedCustomer.frecuencia]}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ultima Compra</p>
                      <p>{selectedCustomer.ultimaCompra}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-chart-2" />
                    <p className="text-2xl font-bold">${selectedCustomer.totalCompras.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Compras</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <Droplets className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{selectedCustomer.garrafonesEnPrestamo}</p>
                    <p className="text-xs text-muted-foreground">Garrafones</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <AlertTriangle
                      className={`h-6 w-6 mx-auto mb-2 ${
                        selectedCustomer.credito > 0 ? "text-destructive" : "text-success"
                      }`}
                    />
                    <p className="text-2xl font-bold">${selectedCustomer.credito.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      Credito (Limite: ${selectedCustomer.limiteCredito.toLocaleString()})
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Nueva Venta
                  </button>
                  <button className="flex-1 h-10 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                    Registrar Pago
                  </button>
                  <button className="h-10 px-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors">
                    <Edit className="h-4 w-4" />
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
