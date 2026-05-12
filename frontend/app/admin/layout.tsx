"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { AccessMessage } from "@/components/auth/access-message"
import { ALL_ADMIN_PERMISSIONS } from "@/lib/permissions"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, status, hasAnyPermission, refresh } = useAuth()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    refresh().finally(() => setChecking(false))
  }, [refresh])

  if (checking || status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Validando permisos...
      </div>
    )
  }

  if (status === "unauthenticated" || !user) {
    return null
  }

  if (!hasAnyPermission([...ALL_ADMIN_PERMISSIONS])) {
    return (
      <AccessMessage
        title="No tienes permisos de administración"
        description="Tu cuenta no tiene permisos para acceder a ninguna sección de administración. Solicita acceso a un administrador."
        actionHref="/panel"
        actionLabel="Ir al panel"
        tone="danger"
      />
    )
  }

  return <>{children}</>
}