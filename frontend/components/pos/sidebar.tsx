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
  Droplets,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCog,
  CreditCard,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ADMIN_PERMISSIONS } from "@/lib/permissions"
import { useAuth } from "@/components/auth/auth-provider"

type NavItem = {
  href: string
  icon: LucideIcon
  label: string
  permissions?: readonly string[]
}

const navItems: readonly NavItem[] = [
  { href: "/panel", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/panel/ventas", icon: ShoppingCart, label: "Punto de Venta" },
  { href: "/panel/inventario", icon: Package, label: "Inventario" },
  { href: "/panel/garrafones", icon: Droplets, label: "Garrafones" },
  { href: "/panel/clientes", icon: Users, label: "Clientes" },
  { href: "/panel/rutas", icon: Truck, label: "Rutas y Entregas" },
  { href: "/panel/caja", icon: DollarSign, label: "Caja" },
  { href: "/panel/reportes", icon: FileText, label: "Reportes" },
]

const adminItems: readonly NavItem[] = [
  {
    href: "/admin/usuarios",
    icon: UserCog,
    label: "Usuarios",
    permissions: ADMIN_PERMISSIONS.users,
  },
  {
    href: "/admin/roles",
    icon: Shield,
    label: "Roles y Permisos",
    permissions: ADMIN_PERMISSIONS.roles,
  },
  {
    href: "/admin/suscripciones",
    icon: CreditCard,
    label: "Suscripciones",
    permissions: ADMIN_PERMISSIONS.subscriptions,
  },
]

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem
  pathname: string
  collapsed: boolean
}) {
  const isActive = pathname === item.href
  return (
    <li>
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
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { hasAnyPermission } = useAuth()
  const isAdminSection = pathname.startsWith("/admin")

  const visibleAdminItems = adminItems.filter(
    (item) => !item.permissions || hasAnyPermission([...item.permissions])
  )
  const primaryItems = isAdminSection ? visibleAdminItems : navItems

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <Droplets className="h-8 w-8 text-primary shrink-0" />
        {!collapsed && (
          <span className="ml-3 text-xl font-bold text-sidebar-foreground">
            AguaVent
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {primaryItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
            />
          ))}
        </ul>

        {!isAdminSection && visibleAdminItems.length > 0 && (
          <div className="mt-6 pt-6 border-t border-sidebar-border">
            {!collapsed && (
              <p className="px-4 mb-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                Administración
              </p>
            )}
            <ul className="space-y-1 px-2">
              {visibleAdminItems.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                />
              ))}
            </ul>
          </div>
        )}
      </nav>

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
