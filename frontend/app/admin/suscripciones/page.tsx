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
  type SubscriptionListItem,
  type SubscriptionStats,
  type UserSearchResult,
} from "@/lib/types"
import {
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  Power,
  X,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react"

type Feedback = { type: "success" | "error"; message: string } | null

type CreateForm = {
  user_id: string
  max_users: number
  is_active: boolean
  starts_at: string
  cutoff_date: string
  last_payment_at: string
}

type EditForm = {
  max_users: number
  is_active: boolean
  starts_at: string
  cutoff_date: string
  last_payment_at: string
}

type PaymentForm = {
  paid_at: string
  new_cutoff_date: string
}

const statusConfig: Record<
  string,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  active: { label: "Activa", color: "text-success bg-success/10", icon: CheckCircle },
  due_soon: { label: "Por vencer", color: "text-warning bg-warning/10", icon: Clock },
  expired: { label: "Vencida", color: "text-destructive bg-destructive/10", icon: XCircle },
  inactive: { label: "Inactiva", color: "text-muted-foreground bg-muted", icon: XCircle },
  no_cutoff: {
    label: "Sin fecha límite",
    color: "text-primary bg-primary/10",
    icon: Calendar,
  },
}

const emptyEdit: EditForm = {
  max_users: 1,
  is_active: true,
  starts_at: "",
  cutoff_date: "",
  last_payment_at: "",
}

function isoToDate(value: string | null): string {
  if (!value) return ""
  return value.length >= 10 ? value.slice(0, 10) : value
}

function isoToDatetimeLocal(value: string | null): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function SuscripcionesPage() {
  const { hasPermission } = useAuth()
  const [items, setItems] = useState<SubscriptionListItem[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [totalSubscriptions, setTotalSubscriptions] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"" | "active" | "inactive" | "expired">(
    "",
  )
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>({
    user_id: "",
    max_users: 1,
    is_active: false,
    starts_at: "",
    cutoff_date: "",
    last_payment_at: "",
  })
  const [userQuery, setUserQuery] = useState("")
  const [userResults, setUserResults] = useState<UserSearchResult[]>([])
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)

  const [showEdit, setShowEdit] = useState(false)
  const [editTarget, setEditTarget] = useState<SubscriptionListItem | null>(null)
  const [editForm, setEditForm] = useState<EditForm>(emptyEdit)

  const [showPayment, setShowPayment] = useState(false)
  const [paymentTarget, setPaymentTarget] = useState<SubscriptionListItem | null>(null)
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    paid_at: "",
    new_cutoff_date: "",
  })

  const [submitting, setSubmitting] = useState(false)

  const canCreate = hasPermission("admin.subscriptions.create")
  const canUpdate = hasPermission("admin.subscriptions.update")
  const canDelete = hasPermission("admin.subscriptions.delete")
  const canPayments = hasPermission("admin.subscriptions.payments")
  const canStats = hasPermission("admin.subscriptions.stats")
  const canDeactivateExpired = hasPermission("admin.subscriptions.deactivate_expired")
  const pageSize = 50

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim().length >= 2) params.set("q", search.trim())
      if (filterStatus === "active") params.set("active", "true")
      if (filterStatus === "inactive") params.set("active", "false")
      if (filterStatus === "expired") params.set("expired", "true")
      params.set("limit", String(pageSize))
      params.set("offset", String(page * pageSize))
      const qs = params.toString()
      const data = toPage(
        await api<Page<SubscriptionListItem> | SubscriptionListItem[]>(
          `/admin/subscriptions${qs ? `?${qs}` : ""}`,
        ),
      )
      setItems(data.items)
      setTotalSubscriptions(data.total)
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al cargar suscripciones",
      })
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, page])

  const loadStats = useCallback(async () => {
    if (!canStats) return
    try {
      const data = await api<SubscriptionStats>("/admin/subscriptions/stats")
      setStats(data)
    } catch {
      // sin permisos: dejar null
    }
  }, [canStats])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  useEffect(() => {
    setPage(0)
  }, [search, filterStatus])

  useEffect(() => {
    const t = setTimeout(() => {
      void loadList()
    }, 250)
    return () => clearTimeout(t)
  }, [loadList])

  useEffect(() => {
    if (userQuery.trim().length < 2) {
      setUserResults([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: userQuery.trim(),
          limit: "20",
          offset: "0",
        })
        const data = toPage(
          await api<Page<UserSearchResult> | UserSearchResult[]>(
            `/admin/subscriptions/users/without-subscription?${params.toString()}`,
          ),
        )
        setUserResults(data.items)
      } catch {
        setUserResults([])
      }
    }, 250)
    return () => clearTimeout(t)
  }, [userQuery])

  const openCreate = () => {
    setSelectedUser(null)
    setUserQuery("")
    setUserResults([])
    setCreateForm({
      user_id: "",
      max_users: 1,
      is_active: false,
      starts_at: "",
      cutoff_date: "",
      last_payment_at: "",
    })
    setFeedback(null)
    setShowCreate(true)
  }

  const openEdit = (item: SubscriptionListItem) => {
    setEditTarget(item)
    setEditForm({
      max_users: item.max_users,
      is_active: item.is_active,
      starts_at: isoToDatetimeLocal(item.starts_at),
      cutoff_date: isoToDate(item.cutoff_date),
      last_payment_at: isoToDate(item.last_payment_at),
    })
    setOpenMenuId(null)
    setFeedback(null)
    setShowEdit(true)
  }

  const openPayment = (item: SubscriptionListItem) => {
    setPaymentTarget(item)
    const today = new Date().toISOString().slice(0, 10)
    setPaymentForm({
      paid_at: today,
      new_cutoff_date: isoToDate(item.cutoff_date) || today,
    })
    setOpenMenuId(null)
    setFeedback(null)
    setShowPayment(true)
  }

  const buildCreateBody = (form: CreateForm) => {
    const body: Record<string, unknown> = {
      user_id: form.user_id,
      max_users: form.max_users,
      is_active: form.is_active,
    }
    if (form.starts_at) body.starts_at = new Date(form.starts_at).toISOString()
    if (form.cutoff_date) body.cutoff_date = form.cutoff_date
    if (form.last_payment_at) body.last_payment_at = form.last_payment_at
    return body
  }

  const buildEditBody = (form: EditForm) => {
    return {
      max_users: form.max_users,
      is_active: form.is_active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      cutoff_date: form.cutoff_date || null,
      last_payment_at: form.last_payment_at || null,
    }
  }

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!createForm.user_id) {
      setFeedback({ type: "error", message: "Selecciona un usuario titular" })
      return
    }
    setSubmitting(true)
    try {
      await api("/admin/subscriptions", {
        method: "POST",
        body: buildCreateBody(createForm),
      })
      setFeedback({ type: "success", message: "Suscripción creada" })
      setShowCreate(false)
      void loadList()
      void loadStats()
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al crear suscripción",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editTarget) return
    setSubmitting(true)
    try {
      await api(`/admin/subscriptions/${editTarget.id}`, {
        method: "PATCH",
        body: buildEditBody(editForm),
      })
      setFeedback({ type: "success", message: "Suscripción actualizada" })
      setShowEdit(false)
      void loadList()
      void loadStats()
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al actualizar suscripción",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!paymentTarget) return
    setSubmitting(true)
    try {
      await api(`/admin/subscriptions/${paymentTarget.id}/payments`, {
        method: "POST",
        body: {
          paid_at: paymentForm.paid_at,
          new_cutoff_date: paymentForm.new_cutoff_date,
        },
      })
      setFeedback({ type: "success", message: "Pago registrado" })
      setShowPayment(false)
      void loadList()
      void loadStats()
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al registrar pago",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (item: SubscriptionListItem) => {
    setOpenMenuId(null)
    const action = item.is_active ? "deactivate" : "activate"
    try {
      await api(`/admin/subscriptions/${item.id}/${action}`, { method: "POST" })
      setFeedback({
        type: "success",
        message: item.is_active ? "Suscripción desactivada" : "Suscripción activada",
      })
      void loadList()
      void loadStats()
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al cambiar estado",
      })
    }
  }

  const handleDelete = async (item: SubscriptionListItem) => {
    setOpenMenuId(null)
    if (!confirm(`¿Eliminar la suscripción de ${item.owner_email}?`)) return
    try {
      await api(`/admin/subscriptions/${item.id}`, { method: "DELETE" })
      setFeedback({ type: "success", message: "Suscripción eliminada" })
      void loadList()
      void loadStats()
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof ApiError ? err.detail : "Error al eliminar",
      })
    }
  }

  const handleDeactivateExpired = async () => {
    if (!confirm("¿Desactivar todas las suscripciones vencidas?")) return
    try {
      const result = await api<{ message: string }>(
        "/admin/subscriptions/deactivate-expired",
        { method: "POST" },
      )
      setFeedback({ type: "success", message: result.message })
      void loadList()
      void loadStats()
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err instanceof ApiError ? err.detail : "Error al desactivar suscripciones",
      })
    }
  }

  const fallbackStats = useMemo(() => {
    return {
      total: items.length,
      active: items.filter((s) => s.is_active).length,
      due_soon: items.filter((s) => s.status === "due_soon").length,
      expired: items.filter((s) => s.status === "expired").length,
    }
  }, [items])

  const visibleStats = stats ?? {
    total: fallbackStats.total,
    active: fallbackStats.active,
    inactive: fallbackStats.total - fallbackStats.active,
    expired: fallbackStats.expired,
    due_soon: fallbackStats.due_soon,
    without_cutoff_date: 0,
  }
  const pageCount = Math.max(1, Math.ceil(totalSubscriptions / pageSize))
  const canGoPrevious = page > 0
  const canGoNext = (page + 1) * pageSize < totalSubscriptions

  return (
    <RequireAuth permissions={[...ADMIN_PERMISSIONS.subscriptions]}>
      <POSLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Suscripciones</h1>
              <p className="text-muted-foreground">
                Gestiona las suscripciones de los usuarios
              </p>
            </div>
            <div className="flex gap-2">
              {canDeactivateExpired && (
                <button
                  onClick={handleDeactivateExpired}
                  className="flex items-center gap-2 h-10 px-4 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Desactivar vencidas
                </button>
              )}
              {canCreate && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Nueva
                </button>
              )}
            </div>
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              label="Total"
              value={visibleStats.total}
              icon={Users}
              tone="default"
            />
            <StatCard
              label="Activas"
              value={visibleStats.active}
              icon={CheckCircle}
              tone="success"
            />
            <StatCard
              label="Por vencer"
              value={visibleStats.due_soon}
              icon={AlertTriangle}
              tone="warning"
            />
            <StatCard
              label="Vencidas"
              value={visibleStats.expired}
              icon={XCircle}
              tone="destructive"
            />
            <StatCard
              label="Sin fecha"
              value={visibleStats.without_cutoff_date}
              icon={Calendar}
              tone="info"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre o email (mín. 2 caracteres)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "" | "active" | "inactive" | "expired")
              }
              className="h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos</option>
              <option value="active">Activas</option>
              <option value="inactive">Inactivas</option>
              <option value="expired">Vencidas</option>
            </select>
          </div>

          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Propietario
                    </th>
                    <th className="text-left p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Estado
                    </th>
                    <th className="text-left p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Vencimiento
                    </th>
                    <th className="text-left p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Usuarios
                    </th>
                    <th className="text-right p-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Cargando...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    items.map((sub) => {
                      const cfg = statusConfig[sub.status] ?? statusConfig.inactive
                      const StatusIcon = cfg.icon
                      return (
                        <tr
                          key={sub.id}
                          className="border-b last:border-b-0 hover:bg-muted/30"
                        >
                          <td className="p-4 font-medium">
                            {sub.owner_name} {sub.owner_last_name}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {sub.owner_email}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            {sub.cutoff_date ? (
                              <div>
                                <p>{sub.cutoff_date}</p>
                                {sub.days_to_cutoff !== null && (
                                  <p className="text-xs text-muted-foreground">
                                    {sub.days_to_cutoff >= 0
                                      ? `${sub.days_to_cutoff} días restantes`
                                      : `Vencida hace ${Math.abs(sub.days_to_cutoff)} días`}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 text-sm">{sub.max_users}</td>
                          <td className="p-4">
                            <div className="relative flex justify-end">
                              <button
                                onClick={() =>
                                  setOpenMenuId(openMenuId === sub.id ? null : sub.id)
                                }
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                              {openMenuId === sub.id && (
                                <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-lg shadow-lg z-10">
                                  {canUpdate && (
                                    <button
                                      onClick={() => openEdit(sub)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Editar
                                    </button>
                                  )}
                                  {canPayments && (
                                    <button
                                      onClick={() => openPayment(sub)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                    >
                                      <DollarSign className="h-4 w-4" />
                                      Registrar pago
                                    </button>
                                  )}
                                  {canUpdate && (
                                    <button
                                      onClick={() => handleToggleActive(sub)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                    >
                                      <Power className="h-4 w-4" />
                                      {sub.is_active ? "Desactivar" : "Activar"}
                                    </button>
                                  )}
                                  {canDelete && (
                                    <button
                                      onClick={() => handleDelete(sub)}
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
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <PaginationBar
            page={page}
            pageCount={pageCount}
            total={totalSubscriptions}
            visible={items.length}
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
            onNext={() => setPage((current) => current + 1)}
            canGoPrevious={canGoPrevious}
            canGoNext={canGoNext}
          />
        </div>

        {showCreate && (
          <Modal title="Nueva Suscripción" onClose={() => setShowCreate(false)}>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Usuario titular
                </label>
                {selectedUser ? (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        {selectedUser.name} {selectedUser.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedUser.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null)
                        setCreateForm((prev) => ({ ...prev, user_id: "" }))
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Buscar usuario (mín. 2 caracteres)..."
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {userResults.length > 0 && (
                      <div className="mt-2 border border-border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                        {userResults.map((u) => (
                          <button
                            type="button"
                            key={u.id}
                            onClick={() => {
                              setSelectedUser(u)
                              setCreateForm((prev) => ({ ...prev, user_id: u.id }))
                              setUserQuery("")
                              setUserResults([])
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-muted transition-colors border-b last:border-b-0"
                          >
                            <p className="text-sm font-medium">
                              {u.name} {u.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Usuarios máx.</label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.max_users}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        max_users: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha de corte
                  </label>
                  <input
                    type="date"
                    value={createForm.cutoff_date}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, cutoff_date: e.target.value })
                    }
                    className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Inicio</label>
                  <input
                    type="datetime-local"
                    value={createForm.starts_at}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, starts_at: e.target.value })
                    }
                    className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Último pago</label>
                  <input
                    type="date"
                    value={createForm.last_payment_at}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        last_payment_at: e.target.value,
                      })
                    }
                    className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createForm.is_active}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, is_active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">Suscripción activa</span>
              </label>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="h-10 px-4 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !createForm.user_id}
                  className="flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Crear
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showEdit && editTarget && (
          <Modal
            title={`Editar suscripción de ${editTarget.owner_email}`}
            onClose={() => setShowEdit(false)}
          >
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Usuarios máx.</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.max_users}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        max_users: Number(e.target.value) || 1,
                      })
                    }
                    className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha de corte
                  </label>
                  <input
                    type="date"
                    value={editForm.cutoff_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, cutoff_date: e.target.value })
                    }
                    className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Inicio</label>
                  <input
                    type="datetime-local"
                    value={editForm.starts_at}
                    onChange={(e) =>
                      setEditForm({ ...editForm, starts_at: e.target.value })
                    }
                    className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Último pago</label>
                  <input
                    type="date"
                    value={editForm.last_payment_at}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        last_payment_at: e.target.value,
                      })
                    }
                    className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm">Suscripción activa</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
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
                  Guardar
                </button>
              </div>
            </form>
          </Modal>
        )}

        {showPayment && paymentTarget && (
          <Modal
            title={`Registrar pago: ${paymentTarget.owner_email}`}
            onClose={() => setShowPayment(false)}
          >
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de pago</label>
                <input
                  type="date"
                  required
                  value={paymentForm.paid_at}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, paid_at: e.target.value })
                  }
                  className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nueva fecha de corte
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.new_cutoff_date}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      new_cutoff_date: e.target.value,
                    })
                  }
                  className="w-full h-10 px-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Esta acción activará la suscripción y actualizará la fecha de corte.
              </p>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowPayment(false)}
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
                  Registrar
                </button>
              </div>
            </form>
          </Modal>
        )}
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
        Mostrando {visible} de {total} suscripciones
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

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: typeof CheckCircle
  tone: "default" | "success" | "warning" | "destructive" | "info"
}) {
  const toneText =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "destructive"
          ? "text-destructive"
          : tone === "info"
            ? "text-primary"
            : ""
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className={`flex items-center gap-2 text-sm ${toneText || "text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className={`mt-1 text-2xl font-bold ${toneText}`}>{value}</p>
    </div>
  )
}
