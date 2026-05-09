"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Users,
  ShoppingCart,
  Package,
  Droplets,
  Truck,
  DollarSign,
  FileText,
  Settings,
  LayoutDashboard,
} from "lucide-react"

type Permiso = {
  id: string
  nombre: string
  descripcion: string
}

type ModuloPermisos = {
  id: string
  nombre: string
  icon: React.ElementType
  permisos: Permiso[]
}

type Rol = {
  id: number
  nombre: string
  descripcion: string
  color: string
  usuarios: number
  permisos: string[]
  esDefault: boolean
}

const modulosPermisos: ModuloPermisos[] = [
  {
    id: "dashboard",
    nombre: "Dashboard",
    icon: LayoutDashboard,
    permisos: [
      { id: "dashboard.ver", nombre: "Ver dashboard", descripcion: "Acceso al panel principal" },
      { id: "dashboard.kpis", nombre: "Ver KPIs", descripcion: "Ver indicadores clave" },
    ],
  },
  {
    id: "ventas",
    nombre: "Punto de Venta",
    icon: ShoppingCart,
    permisos: [
      { id: "ventas.crear", nombre: "Crear ventas", descripcion: "Realizar nuevas ventas" },
      { id: "ventas.ver", nombre: "Ver ventas", descripcion: "Consultar historial de ventas" },
      { id: "ventas.cancelar", nombre: "Cancelar ventas", descripcion: "Anular tickets" },
      { id: "ventas.descuentos", nombre: "Aplicar descuentos", descripcion: "Aplicar descuentos manuales" },
      { id: "ventas.credito", nombre: "Ventas a credito", descripcion: "Realizar ventas a credito" },
    ],
  },
  {
    id: "inventario",
    nombre: "Inventario",
    icon: Package,
    permisos: [
      { id: "inventario.ver", nombre: "Ver inventario", descripcion: "Consultar existencias" },
      { id: "inventario.editar", nombre: "Editar productos", descripcion: "Modificar productos" },
      { id: "inventario.crear", nombre: "Crear productos", descripcion: "Agregar nuevos productos" },
      { id: "inventario.eliminar", nombre: "Eliminar productos", descripcion: "Dar de baja productos" },
      { id: "inventario.ajustes", nombre: "Ajustes de inventario", descripcion: "Realizar ajustes manuales" },
    ],
  },
  {
    id: "garrafones",
    nombre: "Garrafones",
    icon: Droplets,
    permisos: [
      { id: "garrafones.ver", nombre: "Ver garrafones", descripcion: "Ver inventario circular" },
      { id: "garrafones.movimientos", nombre: "Registrar movimientos", descripcion: "Entrada/salida de garrafones" },
      { id: "garrafones.prestamos", nombre: "Gestionar prestamos", descripcion: "Prestar/recuperar garrafones" },
    ],
  },
  {
    id: "clientes",
    nombre: "Clientes",
    icon: Users,
    permisos: [
      { id: "clientes.ver", nombre: "Ver clientes", descripcion: "Consultar directorio" },
      { id: "clientes.crear", nombre: "Crear clientes", descripcion: "Registrar nuevos clientes" },
      { id: "clientes.editar", nombre: "Editar clientes", descripcion: "Modificar datos de clientes" },
      { id: "clientes.eliminar", nombre: "Eliminar clientes", descripcion: "Dar de baja clientes" },
      { id: "clientes.creditos", nombre: "Gestionar creditos", descripcion: "Administrar limites y deudas" },
    ],
  },
  {
    id: "rutas",
    nombre: "Rutas y Entregas",
    icon: Truck,
    permisos: [
      { id: "rutas.ver", nombre: "Ver rutas", descripcion: "Consultar rutas" },
      { id: "rutas.crear", nombre: "Crear rutas", descripcion: "Programar nuevas rutas" },
      { id: "rutas.asignar", nombre: "Asignar repartidores", descripcion: "Asignar personal a rutas" },
      { id: "rutas.completar", nombre: "Completar entregas", descripcion: "Marcar entregas realizadas" },
    ],
  },
  {
    id: "caja",
    nombre: "Caja",
    icon: DollarSign,
    permisos: [
      { id: "caja.ver", nombre: "Ver caja", descripcion: "Consultar movimientos" },
      { id: "caja.abrir", nombre: "Abrir caja", descripcion: "Iniciar turno de caja" },
      { id: "caja.cerrar", nombre: "Cerrar caja", descripcion: "Realizar corte de caja" },
      { id: "caja.retiros", nombre: "Retiros de efectivo", descripcion: "Realizar retiros" },
      { id: "caja.depositos", nombre: "Depositos", descripcion: "Registrar depositos" },
      { id: "caja.gastos", nombre: "Registrar gastos", descripcion: "Agregar gastos operativos" },
    ],
  },
  {
    id: "reportes",
    nombre: "Reportes",
    icon: FileText,
    permisos: [
      { id: "reportes.ventas", nombre: "Reportes de ventas", descripcion: "Ver reportes de ventas" },
      { id: "reportes.inventario", nombre: "Reportes de inventario", descripcion: "Ver reportes de stock" },
      { id: "reportes.clientes", nombre: "Reportes de clientes", descripcion: "Ver reportes de clientes" },
      { id: "reportes.financieros", nombre: "Reportes financieros", descripcion: "Ver reportes de finanzas" },
      { id: "reportes.exportar", nombre: "Exportar reportes", descripcion: "Descargar en Excel/PDF" },
    ],
  },
  {
    id: "configuracion",
    nombre: "Configuracion",
    icon: Settings,
    permisos: [
      { id: "config.empresa", nombre: "Datos de empresa", descripcion: "Editar datos fiscales" },
      { id: "config.usuarios", nombre: "Gestionar usuarios", descripcion: "Administrar usuarios" },
      { id: "config.roles", nombre: "Gestionar roles", descripcion: "Administrar roles y permisos" },
      { id: "config.sucursales", nombre: "Gestionar sucursales", descripcion: "Administrar sucursales" },
      { id: "config.respaldos", nombre: "Respaldos", descripcion: "Crear y restaurar respaldos" },
    ],
  },
]

const mockRoles: Rol[] = [
  {
    id: 1,
    nombre: "Administrador",
    descripcion: "Acceso completo a todas las funciones del sistema",
    color: "bg-primary/10 text-primary border-primary/20",
    usuarios: 1,
    permisos: modulosPermisos.flatMap((m) => m.permisos.map((p) => p.id)),
    esDefault: false,
  },
  {
    id: 2,
    nombre: "Supervisor",
    descripcion: "Supervision de operaciones y acceso a reportes",
    color: "bg-warning/10 text-warning border-warning/20",
    usuarios: 1,
    permisos: [
      "dashboard.ver",
      "dashboard.kpis",
      "ventas.crear",
      "ventas.ver",
      "ventas.cancelar",
      "ventas.descuentos",
      "inventario.ver",
      "garrafones.ver",
      "garrafones.movimientos",
      "clientes.ver",
      "clientes.editar",
      "rutas.ver",
      "rutas.crear",
      "caja.ver",
      "caja.abrir",
      "caja.cerrar",
      "reportes.ventas",
      "reportes.inventario",
    ],
    esDefault: false,
  },
  {
    id: 3,
    nombre: "Cajero",
    descripcion: "Operaciones de venta y manejo de caja",
    color: "bg-info/10 text-info border-info/20",
    usuarios: 2,
    permisos: [
      "dashboard.ver",
      "ventas.crear",
      "ventas.ver",
      "garrafones.ver",
      "garrafones.movimientos",
      "clientes.ver",
      "clientes.crear",
      "caja.ver",
      "caja.abrir",
      "caja.cerrar",
    ],
    esDefault: true,
  },
  {
    id: 4,
    nombre: "Repartidor",
    descripcion: "Entregas y recoleccion de garrafones",
    color: "bg-success/10 text-success border-success/20",
    usuarios: 1,
    permisos: [
      "dashboard.ver",
      "garrafones.ver",
      "garrafones.movimientos",
      "garrafones.prestamos",
      "clientes.ver",
      "rutas.ver",
      "rutas.completar",
    ],
    esDefault: false,
  },
]

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null)
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [selectedPermisos, setSelectedPermisos] = useState<string[]>([])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  const togglePermiso = (permisoId: string) => {
    setSelectedPermisos((prev) =>
      prev.includes(permisoId) ? prev.filter((id) => id !== permisoId) : [...prev, permisoId]
    )
  }

  const toggleAllModulePermisos = (modulo: ModuloPermisos) => {
    const moduloPermisoIds = modulo.permisos.map((p) => p.id)
    const allSelected = moduloPermisoIds.every((id) => selectedPermisos.includes(id))
    if (allSelected) {
      setSelectedPermisos((prev) => prev.filter((id) => !moduloPermisoIds.includes(id)))
    } else {
      setSelectedPermisos((prev) => [...new Set([...prev, ...moduloPermisoIds])])
    }
  }

  const openEditModal = (rol: Rol) => {
    setSelectedRol(rol)
    setSelectedPermisos(rol.permisos)
    setExpandedModules([])
    setShowModal(true)
  }

  const openNewModal = () => {
    setSelectedRol(null)
    setSelectedPermisos([])
    setExpandedModules([])
    setShowModal(true)
  }

  const filteredRoles = mockRoles.filter(
    (rol) =>
      rol.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rol.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Roles y Permisos</h1>
            <p className="text-muted-foreground">Define los niveles de acceso al sistema</p>
          </div>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Rol
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRoles.map((rol) => (
            <div
              key={rol.id}
              className={`bg-card border rounded-lg p-6 ${rol.color.includes("border") ? rol.color.split(" ")[2] : "border-border"}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${rol.color.split(" ").slice(0, 2).join(" ")}`}>
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{rol.nombre}</h3>
                      {rol.esDefault && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                          Por defecto
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{rol.descripcion}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{rol.usuarios} usuario(s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-muted-foreground" />
                    <span>{rol.permisos.length} permisos</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(rol)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {!rol.esDefault && rol.usuarios === 0 && (
                    <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                <h2 className="text-lg font-semibold">
                  {selectedRol ? `Editar Rol: ${selectedRol.nombre}` : "Nuevo Rol"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre del Rol</label>
                      <input
                        type="text"
                        defaultValue={selectedRol?.nombre}
                        placeholder="Ej: Supervisor"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <select
                        defaultValue={selectedRol?.color || "bg-primary/10 text-primary"}
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="bg-primary/10 text-primary">Azul (Principal)</option>
                        <option value="bg-warning/10 text-warning">Amarillo</option>
                        <option value="bg-success/10 text-success">Verde</option>
                        <option value="bg-info/10 text-info">Cyan</option>
                        <option value="bg-destructive/10 text-destructive">Rojo</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Descripcion</label>
                      <input
                        type="text"
                        defaultValue={selectedRol?.descripcion}
                        placeholder="Breve descripcion del rol"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Permisos</h3>
                      <span className="text-sm text-muted-foreground">
                        {selectedPermisos.length} seleccionados
                      </span>
                    </div>

                    <div className="space-y-2">
                      {modulosPermisos.map((modulo) => {
                        const Icon = modulo.icon
                        const isExpanded = expandedModules.includes(modulo.id)
                        const moduloPermisoIds = modulo.permisos.map((p) => p.id)
                        const selectedCount = moduloPermisoIds.filter((id) =>
                          selectedPermisos.includes(id)
                        ).length
                        const allSelected = selectedCount === moduloPermisoIds.length

                        return (
                          <div key={modulo.id} className="border border-border rounded-lg overflow-hidden">
                            <div
                              className="flex items-center gap-3 p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => toggleModule(modulo.id)}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleAllModulePermisos(modulo)
                                }}
                                className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                                  allSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : selectedCount > 0
                                    ? "bg-primary/50 border-primary/50 text-primary-foreground"
                                    : "border-border hover:border-primary/50"
                                }`}
                              >
                                {(allSelected || selectedCount > 0) && <Check className="h-3 w-3" />}
                              </button>
                              <Icon className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium flex-1">{modulo.nombre}</span>
                              <span className="text-sm text-muted-foreground">
                                {selectedCount}/{moduloPermisoIds.length}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            {isExpanded && (
                              <div className="p-3 space-y-2 bg-background">
                                {modulo.permisos.map((permiso) => (
                                  <label
                                    key={permiso.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedPermisos.includes(permiso.id)}
                                      onChange={() => togglePermiso(permiso.id)}
                                      className="h-4 w-4 rounded border-border"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{permiso.nombre}</p>
                                      <p className="text-xs text-muted-foreground">{permiso.descripcion}</p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-border shrink-0">
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
                  {selectedRol ? "Guardar Cambios" : "Crear Rol"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </POSLayout>
  )
}
