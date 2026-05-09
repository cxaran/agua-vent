"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Check,
  MapPin,
  Phone,
  Mail,
  Clock,
  Users,
  DollarSign,
  MoreVertical,
  Power,
} from "lucide-react"

type Sucursal = {
  id: number
  nombre: string
  codigo: string
  direccion: string
  colonia: string
  ciudad: string
  estado: string
  codigoPostal: string
  telefono: string
  email: string
  encargado: string
  horario: string
  status: "activa" | "inactiva"
  empleados: number
  ventasHoy: number
  esMatriz: boolean
}

const mockSucursales: Sucursal[] = [
  {
    id: 1,
    nombre: "Matriz - Centro",
    codigo: "SUC-001",
    direccion: "Av. Principal 123",
    colonia: "Centro",
    ciudad: "Ciudad de Mexico",
    estado: "CDMX",
    codigoPostal: "06000",
    telefono: "555-111-2222",
    email: "matriz@aguapura.com",
    encargado: "Carlos Martinez",
    horario: "07:00 - 20:00",
    status: "activa",
    empleados: 5,
    ventasHoy: 45680,
    esMatriz: true,
  },
  {
    id: 2,
    nombre: "Sucursal Norte",
    codigo: "SUC-002",
    direccion: "Calle Norte 456",
    colonia: "Industrial Norte",
    ciudad: "Ciudad de Mexico",
    estado: "CDMX",
    codigoPostal: "07000",
    telefono: "555-222-3333",
    email: "norte@aguapura.com",
    encargado: "Jorge Hernandez",
    horario: "08:00 - 19:00",
    status: "activa",
    empleados: 3,
    ventasHoy: 28450,
    esMatriz: false,
  },
  {
    id: 3,
    nombre: "Sucursal Sur",
    codigo: "SUC-003",
    direccion: "Av. Sur 789",
    colonia: "Zona Sur",
    ciudad: "Ciudad de Mexico",
    estado: "CDMX",
    codigoPostal: "09000",
    telefono: "555-333-4444",
    email: "sur@aguapura.com",
    encargado: "Maria Lopez",
    horario: "07:30 - 18:30",
    status: "inactiva",
    empleados: 2,
    ventasHoy: 0,
    esMatriz: false,
  },
]

const estados = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "CDMX", "Coahuila", "Colima", "Durango", "Estado de Mexico", "Guanajuato",
  "Guerrero", "Hidalgo", "Jalisco", "Michoacan", "Morelos", "Nayarit", "Nuevo Leon",
  "Oaxaca", "Puebla", "Queretaro", "Quintana Roo", "San Luis Potosi", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatan", "Zacatecas",
]

export default function SucursalesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const filteredSucursales = mockSucursales.filter(
    (sucursal) =>
      sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openEditModal = (sucursal: Sucursal) => {
    setSelectedSucursal(sucursal)
    setShowModal(true)
    setOpenMenuId(null)
  }

  const openNewModal = () => {
    setSelectedSucursal(null)
    setShowModal(true)
  }

  const totalEmpleados = mockSucursales.reduce((acc, s) => acc + s.empleados, 0)
  const totalVentas = mockSucursales.reduce((acc, s) => acc + s.ventasHoy, 0)
  const sucursalesActivas = mockSucursales.filter((s) => s.status === "activa").length

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Sucursales</h1>
            <p className="text-muted-foreground">Administra las ubicaciones de tu negocio</p>
          </div>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Sucursal
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="h-4 w-4" />
              <span className="text-sm">Total Sucursales</span>
            </div>
            <p className="text-2xl font-bold">{mockSucursales.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Power className="h-4 w-4" />
              <span className="text-sm">Activas</span>
            </div>
            <p className="text-2xl font-bold text-success">{sucursalesActivas}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Empleados</span>
            </div>
            <p className="text-2xl font-bold">{totalEmpleados}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Ventas Hoy</span>
            </div>
            <p className="text-2xl font-bold">${totalVentas.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar sucursales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Sucursales Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredSucursales.map((sucursal) => (
            <div
              key={sucursal.id}
              className={`bg-card border rounded-lg overflow-hidden ${
                sucursal.status === "inactiva" ? "opacity-60" : ""
              } ${sucursal.esMatriz ? "border-primary/50" : "border-border"}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        sucursal.esMatriz ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{sucursal.nombre}</h3>
                        {sucursal.esMatriz && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded font-medium">
                            Matriz
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{sucursal.codigo}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === sucursal.id ? null : sucursal.id)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenuId === sucursal.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => openEditModal(sucursal)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Editar
                        </button>
                        {!sucursal.esMatriz && (
                          <button
                            onClick={() => setOpenMenuId(null)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span>
                      {sucursal.direccion}, {sucursal.colonia}, {sucursal.ciudad}, {sucursal.estado}{" "}
                      {sucursal.codigoPostal}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{sucursal.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{sucursal.horario}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Encargado: {sucursal.encargado}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-t border-border">
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    <strong>{sucursal.empleados}</strong> empleados
                  </span>
                  <span>
                    <strong>${sucursal.ventasHoy.toLocaleString()}</strong> ventas hoy
                  </span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    sucursal.status === "activa"
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {sucursal.status === "activa" ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold">
                  {selectedSucursal ? `Editar: ${selectedSucursal.nombre}` : "Nueva Sucursal"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre de la Sucursal</label>
                    <input
                      type="text"
                      defaultValue={selectedSucursal?.nombre}
                      placeholder="Ej: Sucursal Centro"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Codigo</label>
                    <input
                      type="text"
                      defaultValue={selectedSucursal?.codigo}
                      placeholder="SUC-001"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Direccion
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Calle y Numero</label>
                      <input
                        type="text"
                        defaultValue={selectedSucursal?.direccion}
                        placeholder="Av. Principal 123"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Colonia</label>
                      <input
                        type="text"
                        defaultValue={selectedSucursal?.colonia}
                        placeholder="Centro"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Ciudad</label>
                      <input
                        type="text"
                        defaultValue={selectedSucursal?.ciudad}
                        placeholder="Ciudad de Mexico"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Estado</label>
                      <select
                        defaultValue={selectedSucursal?.estado}
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Seleccionar estado</option>
                        {estados.map((estado) => (
                          <option key={estado} value={estado}>
                            {estado}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Codigo Postal</label>
                      <input
                        type="text"
                        defaultValue={selectedSucursal?.codigoPostal}
                        placeholder="06000"
                        maxLength={5}
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contacto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefono</label>
                      <input
                        type="text"
                        defaultValue={selectedSucursal?.telefono}
                        placeholder="555-123-4567"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={selectedSucursal?.email}
                        placeholder="sucursal@ejemplo.com"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Encargado</label>
                      <select
                        defaultValue={selectedSucursal?.encargado}
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Seleccionar encargado</option>
                        <option value="Carlos Martinez">Carlos Martinez</option>
                        <option value="Jorge Hernandez">Jorge Hernandez</option>
                        <option value="Maria Lopez">Maria Lopez</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Horario</label>
                      <input
                        type="text"
                        defaultValue={selectedSucursal?.horario}
                        placeholder="07:00 - 20:00"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-6 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={selectedSucursal?.esMatriz}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span>Esta es la sucursal matriz</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={selectedSucursal?.status === "activa"}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span>Sucursal activa</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-10 px-4 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                    {selectedSucursal ? "Guardar Cambios" : "Crear Sucursal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </POSLayout>
  )
}
