"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplets, LogIn, Menu, MonitorCog, X } from "lucide-react"
import { useState } from "react"

import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const { status } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
        <Link href="/" className="flex items-center gap-2">
          <Droplets className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold">AguaVent</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {status === "authenticated" ? (
            <Link
              href="/panel"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <MonitorCog className="h-4 w-4" />
              Ir al panel
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-muted"
              >
                <LogIn className="h-4 w-4" />
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          aria-label="Abrir menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-4 py-3 gap-1 text-sm">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border my-2" />
            {status === "authenticated" ? (
              <Link
                href="/panel"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-primary font-medium"
              >
                Ir al panel
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md hover:bg-muted"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-primary font-medium"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
