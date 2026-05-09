"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  DollarSign,
  FileText,
  Settings,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  UserCog,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", shortLabel: "Inicio" },
  { href: "/ventas", icon: ShoppingCart, label: "Punto de Venta", shortLabel: "Ventas" },
  { href: "/inventario", icon: Package, label: "Inventario", shortLabel: "Inv." },
  { href: "/garrafones", icon: Droplets, label: "Garrafones", shortLabel: "Garr." },
  { href: "/clientes", icon: Users, label: "Clientes", shortLabel: "Cli." },
  { href: "/rutas", icon: Truck, label: "Rutas y Entregas", shortLabel: "Rutas" },
  { href: "/caja", icon: DollarSign, label: "Caja", shortLabel: "Caja" },
  { href: "/reportes", icon: FileText, label: "Reportes", shortLabel: "Rep." },
]

const adminItems = [
  { href: "/usuarios", icon: UserCog, label: "Usuarios", shortLabel: "Usr." },
  { href: "/roles", icon: Shield, label: "Roles y Permisos", shortLabel: "Roles" },
  { href: "/sucursales", icon: Building2, label: "Sucursales", shortLabel: "Suc." },
  { href: "/configuracion", icon: Settings, label: "Configuracion", shortLabel: "Config." },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Droplets className="h-8 w-8 text-primary shrink-0" />
        {!collapsed && (
          <span className="ml-3 text-xl font-bold text-sidebar-foreground">
            AguaVent
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Admin Section */}
        <div className="mt-6 pt-6 border-t border-sidebar-border">
          {!collapsed && (
            <p className="px-4 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Administracion
            </p>
          )}
          <ul className="space-y-1 px-2">
            {adminItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  )
}
