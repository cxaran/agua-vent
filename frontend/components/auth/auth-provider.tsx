"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/lib/api"
import type { CurrentUser } from "@/lib/types"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextValue = {
  user: CurrentUser | null
  status: AuthStatus
  refresh: () => Promise<CurrentUser | null>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const inflight = useRef<Promise<CurrentUser | null> | null>(null)

  const refresh = useCallback(async (): Promise<CurrentUser | null> => {
    if (inflight.current) return inflight.current

    const request = (async () => {
      try {
        const data = await api<CurrentUser>("/auth/me")
        setUser(data)
        setStatus("authenticated")
        return data
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setUser(null)
          setStatus("unauthenticated")
          return null
        }
        setUser(null)
        setStatus("unauthenticated")
        return null
      } finally {
        inflight.current = null
      }
    })()

    inflight.current = request
    return request
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(
    async (email: string, password: string) => {
      await api("/auth/login", {
        method: "POST",
        body: { email, password },
      })
      await refresh()
    },
    [refresh]
  )

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" })
    } catch {
      // even if backend errors, clear local state
    }
    setUser(null)
    setStatus("unauthenticated")
    router.replace("/login")
  }, [router])

  const hasPermission = useCallback(
    (permission: string) => Boolean(user?.permissions?.includes(permission)),
    [user]
  )

  const hasAnyPermission = useCallback(
    (permissions: string[]) =>
      Boolean(user && permissions.some((p) => user.permissions.includes(p))),
    [user]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      refresh,
      login,
      logout,
      hasPermission,
      hasAnyPermission,
    }),
    [user, status, refresh, login, logout, hasPermission, hasAnyPermission]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>")
  }
  return ctx
}
