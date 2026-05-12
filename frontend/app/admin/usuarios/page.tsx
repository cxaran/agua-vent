"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import { RequireAuth } from "@/components/auth/require-auth"
import { ADMIN_PERMISSIONS } from "@/lib/permissions"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { toPage, type AdminUser, type Page, type RoleListItem } from "@/lib/types"
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Mail,
  Key,
  X,
  Check,
  Eye,
  EyeOff,
  Power,
  Lock,
  Loader2,
} from "lucide-react"

type Feedback = { type: "success" | "error"; message: string } | null

type UserFormState = {
  name: string
  last_name: string
  email: string
  password: string
  is_active: boolean
  role_ids: string[]
}

const initialForm: UserFormState = {
  name: "",
  last_name: "",
  email: "",
  password: "",
  is_active: true,
  role_ids: [],
}

function fromUser(user: AdminUser): UserFormState {
  return {
    name: user.name,
    last_name: user.last_name,
    email: user.email,
    password: "",
    is_active: user.is_active,
    role_ids: user.roles.map((r) => r.id),
  }
}

export default function UsuariosPage() {
  const { hasPermission } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<RoleListItem[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRoleId, setFilterRoleId] = useState("")
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("")
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [form, setForm] = useState<UserFormState>(initialForm)
  const [newPassword, setNewPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const canCreate = hasPermission("admin.users.create")
  const canUpdate = hasPermission("admin.users.update")
  const canDelete = hasPermission("admin.users.delete")
  const canResetPassword = hasPermission("admin.users.password.reset")
  const canUpdateRoles = hasPermission("admin.users.roles.update")
  const pageSize = 50

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm.trim().length >= 2) params.set("q", searchTerm.trim())
      if (filterRoleId) params.set("role_id", filterRoleId)
      if (filterActive !== "") params.set("active", filterActive)
      params.set("limit", String(pageSize))
      params.set("offset", String(page * pageSize))
      const qs = params.toString()
      const data = toPage(
        await api<Page<AdminUser> | AdminUser[]>(`/admin/users${qs ? `?${qs}` : ""}`),
      )
      setUsers(data.items)
      setTotalUsers(data.total)
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al cargar usuarios",
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, filterRoleId, filterActive, page])

  const loadRoles = useCallback(async () => {
    try {
      const data = toPage(
        await api<Page<RoleListItem> | RoleListItem[]>("/admin/roles?limit=200"),
      )
      setRoles(data.items)
    } catch {
      // sin permisos para listar roles: dejar vacío
    }
  }, [])

  useEffect(() => {
    void loadRoles()
  }, [loadRoles])

  useEffect(() => {
    setPage(0)
  }, [searchTerm, filterRoleId, filterActive])

  useEffect(() => {
    const t = setTimeout(() => {
      void loadUsers()
    }, 250)
    return () => clearTimeout(t)
  }, [loadUsers])

  const openCreate = () => {
    setSelectedUser(null)
    setForm(initialForm)
    setShowPassword(false)
    setFeedback(null)
    setShowModal(true)
  }

  const openEdit = (user: AdminUser) => {
    setSelectedUser(user)
    setForm(fromUser(user))
    setShowPassword(false)
    setFeedback(null)
    setOpenMenuId(null)
    setShowModal(true)
  }

  const openResetPassword = (user: AdminUser) => {
    setSelectedUser(user)
    setNewPassword("")
    setShowPassword(false)
    setFeedback(null)
    setOpenMenuId(null)
    setShowPasswordModal(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (selectedUser) {
        const updated = await api<AdminUser>(`/admin/users/${selectedUser.id}`, {
          method: "PATCH",
          body: {
            name: form.name,
            last_name: form.last_name,
            email: form.email,
            is_active: form.is_active,
          },
        })
        if (canUpdateRoles) {
          await api<AdminUser>(`/admin/users/${selectedUser.id}/roles`, {
            method: "PUT",
            body: { role_ids: form.role_ids },
          })
        }
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        setFeedback({ type: "success", message: "Usuario actualizado" })
      } else {
        const created = await api<AdminUser>("/admin/users", {
          method: "POST",
          body: {
            name: form.name,
            last_name: form.last_name,
            email: form.email,
            password: form.password,
            is_active: form.is_active,
            role_ids: form.role_ids,
          },
        })
        setUsers((prev) => [created, ...prev])
        setFeedback({ type: "success", message: "Usuario creado" })
      }
      setShowModal(false)
      void loadUsers()
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al guardar el usuario",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedUser) return
    setSubmitting(true)
    try {
      await api(`/admin/users/${selectedUser.id}/reset-password`, {
        method: "POST",
        body: { password: newPassword },
      })
      setFeedback({ type: "success", message: "Contraseña actualizada" })
      setShowPasswordModal(false)
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiError ? err.detail : "Error al actualizar la contraseña",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (user: AdminUser) => {
    const action = user.is_active ? "deactivate" : "activate"
    setOpenMenuId(null)
    try {
      const updated = await api<AdminUser>(`/admin/users/${user.id}/${action}`, {
        method: "POST",
      })
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setFeedback({
        type: "success",
        message: updated.is_active ? "Usuario activado" : "Usuario desactivado",
      })
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al cambiar estado",
      })
    }
  }

  const handleDelete = async (user: AdminUser) => {
    setOpenMenuId(null)
    if (!confirm(`¿Eliminar al usuario ${user.email}?`)) return
    try {
      await api(`/admin/users/${user.id}`, { method: "DELETE" })
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setFeedback({ type: "success", message: "Usuario eliminado" })
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al eliminar",
      })
    }
  }

  const toggleFormRole = (roleId: string) => {
    setForm((prev) => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter((id) => id !== roleId)
        : [...prev.role_ids, roleId],
    }))
  }

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.is_active).length,
      inactive: users.filter((u) => !u.is_active).length,
      withSubscription: users.filter((u) => u.has_subscription).length,
    }
  }, [users])

  const pageCount = Math.max(1, Math.ceil(totalUsers / pageSize))
  const canGoPrevious = page > 0
  const canGoNext = (page + 1) * pageSize < totalUsers

  return (
    <RequireAuth permissions={[...ADMIN_PERMISSIONS.users]}>
      <POSLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Usuarios</h1>
              <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
            </div>
            {canCreate && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </button>
            )}
          </div>

          {feedback && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Usuarios" value={stats.total} />
            <StatCard label="Activos" value={stats.active} tone="success" />
            <StatCard label="Inactivos" value={stats.inactive} tone="muted" />
            <StatCard label="Con suscripción" value={stats.withSubscription} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar (mín. 2 caracteres)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={filterRoleId}
              onChange={(e) => setFilterRoleId(e.target.value)}
              className="h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value as "" | "true" | "false")}
              className="h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Roles</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Suscripción</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {user.name[0]?.toUpperCase()}
                              {user.last_name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.name} {user.last_name}
                              </p>
                              {user.locked_until && new Date(user.locked_until) > new Date() && (
                                <p className="text-xs text-warning flex items-center gap-1">
                                  <Lock className="h-3 w-3" />
                                  Bloqueado
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            {user.email}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length === 0 ? (
                              <span className="text-xs text-muted-foreground">Sin roles</span>
                            ) : (
                              user.roles.map((role) => (
                                <span
                                  key={role.id}
                                  className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                >
                                  {role.name}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {user.has_subscription ? (
                            <span className="text-success">Activa</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.is_active
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {user.is_active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="relative flex justify-end">
                            <button
                              onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openMenuId === user.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg z-10">
                                {canUpdate && (
                                  <button
                                    onClick={() => openEdit(user)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Editar
                                  </button>
                                )}
                                {canResetPassword && (
                                  <button
                                    onClick={() => openResetPassword(user)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                  >
                                    <Key className="h-4 w-4" />
                                    Cambiar contraseña
                                  </button>
                                )}
                                {canUpdate && (
                                  <button
                                    onClick={() => handleToggleActive(user)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                  >
                                    <Power className="h-4 w-4" />
                                    {user.is_active ? "Desactivar" : "Activar"}
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    onClick={() => handleDelete(user)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationBar
            page={page}
            pageCount={pageCount}
            total={totalUsers}
            visible={users.length}
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
            onNext={() => setPage((current) => current + 1)}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
          />

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

                <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre</label>
                      <input
                        type="text"
                        required
                        minLength={1}
                        maxLength={50}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Apellido</label>
                      <input
                        type="text"
                        required
                        minLength={1}
                        maxLength={50}
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    {!selectedUser && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Contraseña</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={8}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            className="w-full h-10 px-4 pr-10 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Mínimo 8 caracteres, debe contener minúscula y número.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Roles
                    </h3>
                    {roles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No tienes permiso para listar roles o no hay roles disponibles.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {roles.map((role) => (
                          <label
                            key={role.id}
                            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={form.role_ids.includes(role.id)}
                              onChange={() => toggleFormRole(role.id)}
                              disabled={Boolean(selectedUser) && !canUpdateRoles}
                              className="h-4 w-4 rounded border-border"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{role.name}</p>
                              {role.description && (
                                <p className="text-xs text-muted-foreground">{role.description}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border pt-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span>Usuario activo</span>
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
                      disabled={submitting}
                      className="flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {selectedUser ? "Guardar Cambios" : "Crear Usuario"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showPasswordModal && selectedUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form className="p-6 space-y-4" onSubmit={handleResetPassword}>
                  <p className="text-sm text-muted-foreground">
                    Actualizar contraseña de <strong>{selectedUser.email}</strong>.
                  </p>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full h-10 px-4 pr-10 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mínimo 8 caracteres, debe contener minúscula y número.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(false)}
                      className="h-10 px-4 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Actualizar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </POSLayout>
    </RequireAuth>
  )
}

function PaginationBar({
  page,
  pageCount,
  total,
  visible,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: {
  page: number
  pageCount: number
  total: number
  visible: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>
        Mostrando {visible} de {total} usuarios
      </span>
      <div className="flex items-center gap-3">
        <span>
          Página {page + 1} de {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canGoPrevious}
            onClick={onPrevious}
            className="h-9 px-3 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={onNext}
            className="h-9 px-3 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: number
  tone?: "default" | "success" | "muted"
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "muted" ? "text-muted-foreground" : ""
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${toneClass}`}>{value}</p>
    </div>
  )
}
