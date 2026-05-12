"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { ADMIN_PERMISSIONS } from "@/lib/permissions"

const adminRoutes: { href: string; permissions: readonly string[] }[] = [
  { href: "/admin/usuarios", permissions: ADMIN_PERMISSIONS.users },
  { href: "/admin/roles", permissions: ADMIN_PERMISSIONS.roles },
  { href: "/admin/suscripciones", permissions: ADMIN_PERMISSIONS.subscriptions },
]

export default function AdminPage() {
  const { hasAnyPermission } = useAuth()
  const router = useRouter()

  useEffect(() => {
    for (const route of adminRoutes) {
      if (hasAnyPermission([...route.permissions])) {
        router.replace(route.href)
        return
      }
    }
    router.replace("/panel")
  }, [hasAnyPermission, router])

  return null
}