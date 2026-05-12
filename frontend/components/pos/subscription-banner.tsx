"use client"

import Link from "next/link"
import { AlertTriangle, Clock, X } from "lucide-react"
import { useState } from "react"

import { useAuth } from "@/components/auth/auth-provider"

const WARNING_THRESHOLD_DAYS = 7

type Tone = "danger" | "warning"

type BannerContent = {
  tone: Tone
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

function buildBanner(
  subscription: ReturnType<typeof useAuth>["user"] extends infer U
    ? U extends { subscription: infer S }
      ? S
      : never
    : never
): BannerContent | null {
  if (!subscription) {
    return {
      tone: "danger",
      title: "No tienes una suscripción activa",
      description:
        "Necesitas una suscripción activa para usar todas las funciones del sistema.",
      ctaLabel: "Ver opciones",
      ctaHref: "/sin-suscripcion",
    }
  }

  const days = subscription.days_to_cutoff
  if (days === null || days === undefined) return null

  if (days < 0) {
    const expired = Math.abs(days)
    return {
      tone: "danger",
      title: `Tu suscripción venció hace ${expired} ${expired === 1 ? "día" : "días"}`,
      description: "Renueva para evitar la suspensión del servicio.",
      ctaLabel: "Renovar",
      ctaHref: "/sin-suscripcion",
    }
  }

  if (days <= WARNING_THRESHOLD_DAYS) {
    return {
      tone: "warning",
      title: `Tu suscripción vence en ${days} ${days === 1 ? "día" : "días"}`,
      description: "Renueva antes de la fecha de corte para no perder acceso.",
      ctaLabel: "Renovar",
      ctaHref: "/sin-suscripcion",
    }
  }

  return null
}

export function SubscriptionBanner() {
  const { user, status } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  if (status !== "authenticated" || !user) return null

  const banner = buildBanner(user.subscription)
  if (!banner || dismissed) return null

  const isDanger = banner.tone === "danger"
  const Icon = isDanger ? AlertTriangle : Clock

  return (
    <div
      className={
        isDanger
          ? "border-b border-destructive/30 bg-destructive/10 text-destructive-foreground"
          : "border-b border-amber-500/30 bg-amber-500/10 text-amber-100"
      }
    >
      <div className="flex items-center gap-3 px-6 py-2.5 text-sm">
        <Icon
          className={
            isDanger
              ? "h-4 w-4 shrink-0 text-destructive"
              : "h-4 w-4 shrink-0 text-amber-400"
          }
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium">{banner.title}</p>
          <p className="text-xs opacity-80">{banner.description}</p>
        </div>
        {banner.ctaHref && banner.ctaLabel && (
          <Link
            href={banner.ctaHref}
            className={
              isDanger
                ? "shrink-0 rounded-md border border-destructive/40 px-3 py-1 text-xs font-medium hover:bg-destructive/20"
                : "shrink-0 rounded-md border border-amber-500/40 px-3 py-1 text-xs font-medium hover:bg-amber-500/20"
            }
          >
            {banner.ctaLabel}
          </Link>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded p-1 opacity-60 hover:opacity-100"
          aria-label="Ocultar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
