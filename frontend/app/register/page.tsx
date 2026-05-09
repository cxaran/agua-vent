"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Droplets, Mail, Lock, User, Key, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()

  // Step 1
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"request" | "confirm">("request")

  // Step 2
  const [token, setToken] = useState("")
  const [name, setName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/v1/auth/register/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || "Error al solicitar token")
      }

      setSuccess("Token de verificacion enviado. Revisa tu email o usa el token de desarrollo.")
      setStep("confirm")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar token")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/v1/auth/register/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          token,
          name,
          last_name: lastName,
          password,
          confirm_password: confirmPassword,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || "Error al confirmar registro")
      }

      router.push("/login?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al confirmar registro")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Droplets className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">AguaVent</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Crea tu cuenta y comienza a gestionar tu purificadora
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8">
            <Droplets className="h-10 w-10 text-primary" />
            <span className="ml-3 text-2xl font-bold">AguaVent</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">
                {step === "request" ? "Crear Cuenta" : "Completar Registro"}
              </h2>
              <p className="text-muted-foreground mt-2">
                {step === "request"
                  ? "Ingresa tu email para recibir un token de verificacion"
                  : "Ingresa el token y tus datos"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success">
                {success}
              </div>
            )}

            {step === "request" ? (
              <form onSubmit={handleRequestToken} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Enviando..." : "Solicitar Token"} <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Token de Verificacion</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Pega aqui tu token"
                      required
                      className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                      minLength={4}
                      className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Apellido</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tu apellido"
                      required
                      minLength={4}
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
                      placeholder="Minimo 8 caracteres"
                      required
                      minLength={8}
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

                <div>
                  <label className="block text-sm font-medium mb-2">Confirmar Contrasena</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contrasena"
                      required
                      minLength={8}
                      className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Registrando..." : "Completar Registro"} <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("request"); setSuccess(""); setError("") }}
                  className="w-full h-10 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Cambiar email
                </button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Ya tienes cuenta?{" "}
              <a href="/login" className="text-primary hover:underline">
                Inicia sesion
              </a>
            </p>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            AguaVent v1.0.0 - Sistema Local
          </p>
        </div>
      </div>
    </div>
  )
}
