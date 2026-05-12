"use client"

import Link from "next/link"
import { Mail, ShieldCheck, CreditCard, KeyRound, User as UserIcon } from "lucide-react"
import POSLayout from "@/components/pos/pos-layout"
import { useAuth } from "@/components/auth/auth-provider"

export default function MyAccountPage() {
  const { user } = useAuth()

  if (!user) return null

  const fullName = `${user.name} ${user.last_name}`.trim()
  const subscription = user.subscription
  const days = subscription?.days_to_cutoff

  return (
    <POSLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mi cuenta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Información de tu sesión y suscripción.
          </p>
        </div>

        {/* Datos personales */}
        <section className="bg-card border border-border rounded-xl p-6">
          <header className="flex items-center gap-3 mb-4">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Datos personales</h2>
          </header>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Nombre
              </dt>
              <dd className="mt-1 font-medium">{fullName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                Correo
              </dt>
              <dd className="mt-1 font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
              </dd>
            </div>
          </dl>
        </section>

        {/* Suscripción */}
        <section className="bg-card border border-border rounded-xl p-6">
          <header className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Suscripción</h2>
          </header>
          {subscription ? (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                  Estado
                </dt>
                <dd className="mt-1 font-medium">
                  {days === null || days === undefined
                    ? "Activa"
                    : days < 0
                    ? `Vencida hace ${Math.abs(days)} día(s)`
                    : `Activa · ${days} día(s) restantes`}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                  Rol
                </dt>
                <dd className="mt-1 font-medium">
                  {subscription.is_owner ? "Titular" : "Miembro"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground text-xs uppercase tracking-wider">
                  ID de suscripción
                </dt>
                <dd className="mt-1 font-mono text-xs text-muted-foreground">
                  {subscription.id}
                </dd>
              </div>
            </dl>
          ) : (
            <div className="text-sm text-muted-foreground">
              No tienes una suscripción activa.{" "}
              <Link href="/sin-suscripcion" className="text-primary hover:underline">
                Ver opciones
              </Link>
            </div>
          )}
        </section>

        {/* Permisos */}
        <section className="bg-card border border-border rounded-xl p-6">
          <header className="flex items-center gap-3 mb-4">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Permisos asignados</h2>
          </header>
          {user.permissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tu cuenta aún no tiene permisos asignados.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.permissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-1 text-xs font-mono"
                >
                  {perm}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Seguridad */}
        <section className="bg-card border border-border rounded-xl p-6">
          <header className="flex items-center gap-3 mb-4">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Seguridad</h2>
          </header>
          <p className="text-sm text-muted-foreground mb-4">
            Para cambiar tu contraseña, usa el flujo de recuperación. Te enviaremos
            un enlace al correo registrado.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
          >
            <KeyRound className="h-4 w-4" />
            Cambiar contraseña
          </Link>
        </section>
      </div>
    </POSLayout>
  )
}
