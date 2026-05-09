"use client"

import { useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Building2,
  Key,
  X,
  Check,
  Eye,
  EyeOff,
} from "lucide-react"

type Usuario = {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  usuario: string
  rol: string
  sucursales: string[]
  status: "activo" | "inactivo"
  ultimoAcceso: string
  createdAt: string
}

const mockUsuarios: Usuario[] = [
  {
    id: 1,
    nombre: "Carlos",
    apellido: "Martinez",
    email: "carlos@aguapura.com",
    telefono: "555-111-2222",
    usuario: "cmartinez",
    rol: "administrador",
    sucursales: ["Matriz - Centro", "Sucursal Norte", "Sucursal Sur"],
    status: "activo",
    ultimoAcceso: "2024-01-15 09:30",
    createdAt: "2023-01-10",
  },
  {
    id: 2,
    nombre: "Ana",
    apellido: "Rodriguez",
    email: "ana@aguapura.com",
    telefono: "555-222-3333",
    usuario: "arodriguez",
    rol: "cajero",
    sucursales: ["Matriz - Centro"],
    status: "activo",
    ultimoAcceso: "2024-01-15 08:15",
    createdAt: "2023-03-15",
  },
  {
    id: 3,
    nombre: "Pedro",
    apellido: "Sanchez",
    email: "pedro@aguapura.com",
    telefono: "555-333-4444",
    usuario: "psanchez",
    rol: "repartidor",
    sucursales: ["Matriz - Centro", "Sucursal Norte"],
    status: "activo",
    ultimoAcceso: "2024-01-15 07:00",
    createdAt: "2023-06-20",
  },
  {
    id: 4,
    nombre: "Maria",
    apellido: "Lopez",
    email: "maria@aguapura.com",
    telefono: "555-444-5555",
    usuario: "mlopez",
    rol: "cajero",
    sucursales: ["Sucursal Sur"],
    status: "inactivo",
    ultimoAcceso: "2024-01-10 14:20",
    createdAt: "2023-02-28",
  },
  {
    id: 5,
    nombre: "Jorge",
    apellido: "Hernandez",
    email: "jorge@aguapura.com",
    telefono: "555-555-6666",
    usuario: "jhernandez",
    rol: "supervisor",
    sucursales: ["Sucursal Norte"],
    status: "activo",
    ultimoAcceso: "2024-01-14 16:45",
    createdAt: "2023-08-05",
  },
]

const roles = [
  { id: "administrador", nombre: "Administrador", color: "bg-primary/10 text-primary" },
  { id: "supervisor", nombre: "Supervisor", color: "bg-warning/10 text-warning" },
  { id: "cajero", nombre: "Cajero", color: "bg-info/10 text-info" },
  { id: "repartidor", nombre: "Repartidor", color: "bg-success/10 text-success" },
]

const sucursales = ["Matriz - Centro", "Sucursal Norte", "Sucursal Sur"]

export default function UsuariosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const filteredUsuarios = mockUsuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.usuario.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRol = !filterRol || usuario.rol === filterRol
    const matchesStatus = !filterStatus || usuario.status === filterStatus
    return matchesSearch && matchesRol && matchesStatus
  })

  const getRolStyle = (rol: string) => {
    return roles.find((r) => r.id === rol)?.color || "bg-muted text-muted-foreground"
  }

  const getRolName = (rol: string) => {
    return roles.find((r) => r.id === rol)?.nombre || rol
  }

  const openEditModal = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setShowModal(true)
    setOpenMenuId(null)
  }

  return (
    <POSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Usuarios</h1>
            <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
          </div>
          <button
            onClick={() => {
              setSelectedUser(null)
              setShowModal(true)
            }}
            className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Usuarios</p>
            <p className="text-2xl font-bold mt-1">{mockUsuarios.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Activos</p>
            <p className="text-2xl font-bold mt-1 text-success">
              {mockUsuarios.filter((u) => u.status === "activo").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Inactivos</p>
            <p className="text-2xl font-bold mt-1 text-muted-foreground">
              {mockUsuarios.filter((u) => u.status === "inactivo").length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Roles</p>
            <p className="text-2xl font-bold mt-1">{roles.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            className="h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos los roles</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contacto</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rol</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sucursales</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ultimo Acceso</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {usuario.nombre[0]}
                          {usuario.apellido[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {usuario.nombre} {usuario.apellido}
                          </p>
                          <p className="text-sm text-muted-foreground">@{usuario.usuario}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {usuario.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {usuario.telefono}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRolStyle(usuario.rol)}`}>
                        {getRolName(usuario.rol)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{usuario.sucursales.length} sucursal(es)</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          usuario.status === "activo"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {usuario.status === "activo" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{usuario.ultimoAcceso}</td>
                    <td className="p-4">
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === usuario.id ? null : usuario.id)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenuId === usuario.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => openEditModal(usuario)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                            >
                              <Key className="h-4 w-4" />
                              Cambiar contrasena
                            </button>
                            <button
                              onClick={() => setOpenMenuId(null)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold">
                  {selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
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
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <input
                      type="text"
                      defaultValue={selectedUser?.nombre}
                      placeholder="Nombre"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Apellido</label>
                    <input
                      type="text"
                      defaultValue={selectedUser?.apellido}
                      placeholder="Apellido"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={selectedUser?.email}
                      placeholder="correo@ejemplo.com"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefono</label>
                    <input
                      type="text"
                      defaultValue={selectedUser?.telefono}
                      placeholder="555-123-4567"
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Acceso al Sistema
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre de Usuario</label>
                      <input
                        type="text"
                        defaultValue={selectedUser?.usuario}
                        placeholder="usuario"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Rol</label>
                      <select
                        defaultValue={selectedUser?.rol}
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {roles.map((rol) => (
                          <option key={rol.id} value={rol.id}>
                            {rol.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    {!selectedUser && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Contrasena</label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="Contrasena"
                              className="w-full h-10 px-4 pr-10 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">PIN (4 digitos)</label>
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="1234"
                            className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Sucursales Asignadas
                  </h3>
                  <div className="space-y-2">
                    {sucursales.map((sucursal) => (
                      <label key={sucursal} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                        <input
                          type="checkbox"
                          defaultChecked={selectedUser?.sucursales.includes(sucursal)}
                          className="h-4 w-4 rounded border-border"
                        />
                        <span>{sucursal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedUser && (
                  <div className="border-t border-border pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={selectedUser.status === "activo"}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span>Usuario activo</span>
                    </label>
                  </div>
                )}

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
                    {selectedUser ? "Guardar Cambios" : "Crear Usuario"}
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
