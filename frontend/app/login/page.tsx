"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Droplets, Eye, EyeOff, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || "Credenciales invalidas")
      }

      router.push("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Droplets className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">AguaVent</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Sistema integral de punto de venta para purificadoras
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-card/50 rounded-lg p-4 border border-border">
              <p className="font-semibold text-foreground">Control de Garrafones</p>
              <p className="text-muted-foreground text-xs mt-1">Inventario circular completo</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4 border border-border">
              <p className="font-semibold text-foreground">Rutas y Entregas</p>
              <p className="text-muted-foreground text-xs mt-1">Gestion de repartidores</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4 border border-border">
              <p className="font-semibold text-foreground">Clientes y Creditos</p>
              <p className="text-muted-foreground text-xs mt-1">CRM integrado</p>
            </div>
            <div className="bg-card/50 rounded-lg p-4 border border-border">
              <p className="font-semibold text-foreground">Multi-Sucursal</p>
              <p className="text-muted-foreground text-xs mt-1">Gestion centralizada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Droplets className="h-10 w-10 text-primary" />
            <span className="ml-3 text-2xl font-bold">AguaVent</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Iniciar Sesion</h2>
              <p className="text-muted-foreground mt-2">Ingresa tus credenciales para continuar</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Contrasena</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contrasena"
                    required
                    className="w-full h-12 pl-10 pr-12 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">Recordarme</span>
                </label>
                <button type="button" className="text-primary hover:underline">
                  Olvide mi contrasena
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Iniciando sesion..." : "Iniciar Sesion"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                No tienes cuenta?{" "}
                <a href="/register" className="text-primary hover:underline">
                  Registrate aqui
                </a>
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            AguaVent v1.0.0 - Sistema Local
          </p>
        </div>
      </div>
    </div>
  )
}
