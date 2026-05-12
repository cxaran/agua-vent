import Link from "next/link"
import {
  Droplets,
  LogIn,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Building2,
  ArrowRight,
} from "lucide-react"

import { PublicNavbar } from "@/components/public/navbar"
import { PublicFooter } from "@/components/public/footer"

const FEATURES = [
  {
    icon: ShoppingCart,
    title: "Punto de venta",
    description: "Cobra rápido con tickets profesionales y control de caja.",
  },
  {
    icon: Droplets,
    title: "Control de garrafones",
    description: "Inventario circular con préstamos, devoluciones y mermas.",
  },
  {
    icon: Truck,
    title: "Rutas y entregas",
    description: "Asigna repartidores, mide entregas y cobra a domicilio.",
  },
  {
    icon: Users,
    title: "Clientes y créditos",
    description: "CRM con saldos, historial y control de cuentas por cobrar.",
  },
  {
    icon: BarChart3,
    title: "Reportes",
    description: "KPIs de ventas, productos top y rendimiento por sucursal.",
  },
  {
    icon: Building2,
    title: "Multi-sucursal",
    description: "Administra varias sucursales y usuarios desde un solo panel.",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-16 sm:pt-24 pb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground mb-6">
              <Droplets className="h-3.5 w-3.5 text-primary" />
              Punto de venta especializado
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Vende, controla y entrega agua sin complicaciones.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              AguaVent es el sistema integral para purificadoras: ventas, garrafones,
              rutas, clientes y reportes en un solo panel pensado para el día a día.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Crear cuenta
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm font-medium hover:bg-muted"
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Todo lo que tu purificadora necesita</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              Un sistema diseñado específicamente para el negocio del agua, no un
              POS genérico adaptado.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Empieza a operar en minutos
            </h2>
            <p className="mt-3 text-muted-foreground">
              Crea tu cuenta y prueba el sistema. Sin instalaciones complicadas.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
