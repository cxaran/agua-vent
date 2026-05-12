"use client"

import Link from "next/link"
import { AlertCircle, ArrowLeft, LockKeyhole, ReceiptText } from "lucide-react"

type AccessMessageProps = {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
  tone?: "warning" | "danger"
}

export function AccessMessage({
  title,
  description,
  actionHref = "/",
  actionLabel = "Volver al inicio",
  tone = "warning",
}: AccessMessageProps) {
  const Icon = tone === "danger" ? LockKeyhole : ReceiptText

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-7 w-7 text-primary" />
        </div>

        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            Acceso no disponible
          </div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <Link
          href={actionHref}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          {actionLabel}
        </Link>
      </section>
    </main>
  )
}
