"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import POSLayout from "@/components/pos/pos-layout"
import { RequireAuth } from "@/components/auth/require-auth"
import { ADMIN_PERMISSIONS } from "@/lib/permissions"
import { api, ApiError } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import {
  toPage,
  type Page,
  type PermissionGroupRead,
  type RoleListItem,
} from "@/lib/types"
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
  Loader2,
} from "lucide-react"

type Feedback = { type: "success" | "error"; message: string } | null

type RoleFormState = {
  name: string
  description: string
  is_active: boolean
  permissions: string[]
}

const initialForm: RoleFormState = {
  name: "",
  description: "",
  is_active: true,
  permissions: [],
}

function fromRole(role: RoleListItem): RoleFormState {
  return {
    name: role.name,
    description: role.description ?? "",
    is_active: role.is_active,
    permissions: [...role.permissions],
  }
}

export default function RolesPage() {
  const { hasPermission } = useAuth()
  const [roles, setRoles] = useState<RoleListItem[]>([])
  const [groups, setGroups] = useState<PermissionGroupRead[]>([])
  const [totalRoles, setTotalRoles] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<RoleListItem | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const [form, setForm] = useState<RoleFormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)

  const canCreate = hasPermission("admin.roles.create")
  const canUpdate = hasPermission("admin.roles.update")
  const canDelete = hasPermission("admin.roles.delete")
  const canUpdatePermissions = hasPermission("admin.roles.permissions.update")
  const pageSize = 50

  const loadRoles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm.trim().length >= 2) params.set("q", searchTerm.trim())
      params.set("limit", String(pageSize))
      params.set("offset", String(page * pageSize))
      const qs = params.toString()
      const data = toPage(
        await api<Page<RoleListItem> | RoleListItem[]>(
          `/admin/roles${qs ? `?${qs}` : ""}`,
        ),
      )
      setRoles(data.items)
      setTotalRoles(data.total)
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al cargar roles",
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, page])

  const loadGroups = useCallback(async () => {
    try {
      const data = await api<PermissionGroupRead[]>("/admin/roles/permission-groups")
      setGroups(data)
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiError ? err.detail : "Error al cargar grupos de permisos",
      })
    }
  }, [])

  useEffect(() => {
    void loadGroups()
  }, [loadGroups])

  useEffect(() => {
    setPage(0)
  }, [searchTerm])

  useEffect(() => {
    const t = setTimeout(() => {
      void loadRoles()
    }, 250)
    return () => clearTimeout(t)
  }, [loadRoles])

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((id) => id !== groupName)
        : [...prev, groupName],
    )
  }

  const togglePermission = (access: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(access)
        ? prev.permissions.filter((p) => p !== access)
        : [...prev.permissions, access],
    }))
  }

  const toggleAllInGroup = (group: PermissionGroupRead) => {
    const ids = group.permissions.map((p) => p.access)
    const allSelected = ids.every((id) => form.permissions.includes(id))
    setForm((prev) => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter((p) => !ids.includes(p))
        : Array.from(new Set([...prev.permissions, ...ids])),
    }))
  }

  const openCreate = () => {
    setSelectedRole(null)
    setForm(initialForm)
    setExpandedGroups([])
    setFeedback(null)
    setShowModal(true)
  }

  const openEdit = (role: RoleListItem) => {
    setSelectedRole(role)
    setForm(fromRole(role))
    setExpandedGroups([])
    setFeedback(null)
    setShowModal(true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (selectedRole) {
        const updated = await api<RoleListItem>(`/admin/roles/${selectedRole.id}`, {
          method: "PATCH",
          body: {
            name: form.name,
            description: form.description || null,
            is_active: form.is_active,
          },
        })
        let next = updated
        if (canUpdatePermissions) {
          next = await api<RoleListItem>(
            `/admin/roles/${selectedRole.id}/permissions`,
            {
              method: "PUT",
              body: { permissions: form.permissions },
            },
          )
        }
        setRoles((prev) => prev.map((r) => (r.id === next.id ? next : r)))
        setFeedback({ type: "success", message: "Rol actualizado" })
      } else {
        const created = await api<RoleListItem>("/admin/roles", {
          method: "POST",
          body: {
            name: form.name,
            description: form.description || null,
            permissions: form.permissions,
          },
        })
        setRoles((prev) => [created, ...prev])
        setFeedback({ type: "success", message: "Rol creado" })
      }
      setShowModal(false)
      void loadRoles()
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al guardar el rol",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (role: RoleListItem) => {
    if (!confirm(`¿Eliminar el rol "${role.name}"?`)) return
    try {
      await api(`/admin/roles/${role.id}`, { method: "DELETE" })
      setRoles((prev) => prev.filter((r) => r.id !== role.id))
      setFeedback({ type: "success", message: "Rol eliminado" })
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al eliminar el rol",
      })
    }
  }

  const filteredRoles = useMemo(() => roles, [roles])
  const pageCount = Math.max(1, Math.ceil(totalRoles / pageSize))
  const canGoPrevious = page > 0
  const canGoNext = (page + 1) * pageSize < totalRoles

  return (
    <RequireAuth permissions={[...ADMIN_PERMISSIONS.roles]}>
      <POSLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Roles y Permisos</h1>
              <p className="text-muted-foreground">Define los niveles de acceso al sistema</p>
            </div>
            {canCreate && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Nuevo Rol
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

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar roles (mín. 2 caracteres)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
              Cargando roles...
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">Sin resultados</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className={`bg-card border border-border rounded-lg p-6 ${
                    role.is_active ? "" : "opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{role.name}</h3>
                          {!role.is_active && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                              Inactivo
                            </span>
                          )}
                        </div>
                        {role.description && (
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{role.users_count} usuario(s)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-muted-foreground" />
                        <span>{role.permissions_count} permisos</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => openEdit(role)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canDelete && role.users_count === 0 && (
                        <button
                          onClick={() => handleDelete(role)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <PaginationBar
            page={page}
            pageCount={pageCount}
            total={totalRoles}
            visible={roles.length}
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
            onNext={() => setPage((current) => current + 1)}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
          />

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
                  <h2 className="text-lg font-semibold">
                    {selectedRole ? `Editar Rol: ${selectedRole.name}` : "Nuevo Rol"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  className="flex-1 overflow-y-auto p-6 space-y-6"
                  onSubmit={handleSubmit}
                  id="role-form"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre del Rol</label>
                      <input
                        type="text"
                        required
                        minLength={1}
                        maxLength={100}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    {selectedRole && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Estado</label>
                        <label className="flex items-center gap-3 cursor-pointer h-10">
                          <input
                            type="checkbox"
                            checked={form.is_active}
                            onChange={(e) =>
                              setForm({ ...form, is_active: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-border"
                          />
                          <span>Rol activo</span>
                        </label>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Descripción</label>
                      <input
                        type="text"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Breve descripción del rol"
                        className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Permisos</h3>
                      <span className="text-sm text-muted-foreground">
                        {form.permissions.length} seleccionados
                      </span>
                    </div>

                    {selectedRole && !canUpdatePermissions && (
                      <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
                        No tienes el permiso <code>admin.roles.permissions.update</code>; los
                        cambios de permisos no se guardarán.
                      </div>
                    )}

                    <div className="space-y-2">
                      {groups.map((group) => {
                        const isExpanded = expandedGroups.includes(group.name)
                        const ids = group.permissions.map((p) => p.access)
                        const selectedCount = ids.filter((id) =>
                          form.permissions.includes(id),
                        ).length
                        const allSelected = selectedCount === ids.length && ids.length > 0

                        return (
                          <div
                            key={group.name}
                            className="border border-border rounded-lg overflow-hidden"
                          >
                            <div
                              className="flex items-center gap-3 p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => toggleGroup(group.name)}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleAllInGroup(group)
                                }}
                                className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                                  allSelected
                                    ? "bg-primary border-primary text-primary-foreground"
                                    : selectedCount > 0
                                      ? "bg-primary/50 border-primary/50 text-primary-foreground"
                                      : "border-border hover:border-primary/50"
                                }`}
                              >
                                {(allSelected || selectedCount > 0) && (
                                  <Check className="h-3 w-3" />
                                )}
                              </button>
                              <Shield className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium flex-1">{group.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {selectedCount}/{ids.length}
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>

                            {isExpanded && (
                              <div className="p-3 space-y-2 bg-background">
                                {group.permissions.map((permission) => (
                                  <label
                                    key={permission.access}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={form.permissions.includes(permission.access)}
                                      onChange={() => togglePermission(permission.access)}
                                      className="h-4 w-4 rounded border-border"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-mono">{permission.access}</p>
                                      {permission.description && (
                                        <p className="text-xs text-muted-foreground">
                                          {permission.description}
                                        </p>
                                      )}
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
                    form="role-form"
                    disabled={submitting}
                    className="flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {selectedRole ? "Guardar Cambios" : "Crear Rol"}
                  </button>
                </div>
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
        Mostrando {visible} de {total} roles
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
