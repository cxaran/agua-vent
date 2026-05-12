"use client"

import { useState } from "react"
import Link from "next/link"
import { Droplets, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"

import { api, ApiError } from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        body: { email },
      })
      setSent(true)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || "No pudimos enviar el correo")
      } else {
        setError("Error de red")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Droplets className="h-10 w-10 text-primary" />
          <span className="ml-3 text-2xl font-bold">AguaVent</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Revisa tu correo</h2>
              <p className="text-sm text-muted-foreground">
                Si <span className="text-foreground font-medium">{email}</span> está
                registrado, te enviamos un enlace para restablecer tu contraseña.
                Revisa también la carpeta de spam.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Recuperar contraseña</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Ingresa tu correo y te enviaremos un enlace para restablecer tu
                  contraseña.
                </p>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Enviando..." : "Enviar enlace"}
                </button>

                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a iniciar sesión
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
