"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/components/auth/auth-provider"
import { AccessMessage } from "@/components/auth/access-message"

type RequireAuthProps = {
  /**
   * Si se pasa, exige que el usuario tenga al menos uno de estos permisos.
   * Si se omite, solo exige sesión válida.
   */
  permissions?: string[]
  children: React.ReactNode
}

export function RequireAuth({ permissions, children }: RequireAuthProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, status, hasAnyPermission } = useAuth()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [status, router, pathname])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Validando sesión...
      </div>
    )
  }

  if (status === "unauthenticated" || !user) {
    return null
  }

  if (permissions && permissions.length > 0 && !hasAnyPermission(permissions)) {
    return (
      <AccessMessage
        title="No tienes permisos para ver esta página"
        description="Esta sección requiere permisos que tu cuenta no tiene asignados. Solicita acceso a un administrador."
        actionHref="/panel"
        actionLabel="Ir al panel"
        tone="danger"
      />
    )
  }

  return <>{children}</>
}
