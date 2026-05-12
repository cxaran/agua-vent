"use client"

import Link from "next/link"
import { Droplets, CreditCard, Mail, ArrowLeft } from "lucide-react"

import { useAuth } from "@/components/auth/auth-provider"

export default function NoSubscriptionPage() {
  const { user, status } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center mb-8">
          <Droplets className="h-10 w-10 text-primary" />
          <span className="ml-3 text-2xl font-bold">AguaVent</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
            <CreditCard className="h-7 w-7 text-primary" />
          </div>

          <h1 className="text-2xl font-semibold mb-2">
            {user?.subscription === null
              ? "Aún no tienes una suscripción activa"
              : "Renueva tu suscripción"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {user?.subscription === null
              ? "Para acceder al sistema completo de punto de venta, necesitas una suscripción activa. Contáctanos y un asesor te ayudará a elegir el plan correcto."
              : "Tu periodo actual está por terminar o ya venció. Renueva para seguir usando el sistema sin interrupciones."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-left">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Plan Básico
              </p>
              <p className="text-lg font-semibold mt-1">1 sucursal · 1 caja</p>
              <p className="text-xs text-muted-foreground mt-1">
                Hasta 100 productos
              </p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs uppercase tracking-wider text-primary">
                Plan Pro
              </p>
              <p className="text-lg font-semibold mt-1">Multi-sucursal</p>
              <p className="text-xs text-muted-foreground mt-1">
                Usuarios y cajas ilimitadas
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contacto"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Mail className="h-4 w-4" />
              Contactar ventas
            </Link>
            <Link
              href={status === "authenticated" ? "/panel" : "/"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border px-5 text-sm font-medium hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              {status === "authenticated" ? "Volver al panel" : "Volver al inicio"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
