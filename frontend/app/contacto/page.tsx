import { Mail, Phone, MapPin, MessageSquare } from "lucide-react"
import { PublicLayout } from "@/components/public/public-layout"

const CHANNELS = [
  {
    icon: Mail,
    label: "Correo",
    value: "contacto@aguavent.mx",
    href: "mailto:contacto@aguavent.mx",
  },
  {
    icon: Phone,
    label: "Teléfono",
    value: "+52 (55) 0000 0000",
    href: "tel:+5255000000000",
  },
  {
    icon: MapPin,
    label: "Ubicación",
    value: "Ciudad de México, México",
  },
]

export const metadata = {
  title: "Contacto · AguaVent",
}

export default function ContactPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-3 mb-3">
          <MessageSquare className="h-7 w-7 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold">Contacto</h1>
        </div>
        <p className="text-muted-foreground mb-10">
          ¿Quieres una demo, te interesa contratar el servicio o necesitas soporte?
          Escríbenos por cualquiera de estos canales.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {CHANNELS.map((channel) => {
            const Content = (
              <div className="rounded-xl border border-border bg-card p-5 h-full">
                <channel.icon className="h-5 w-5 text-primary mb-3" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {channel.label}
                </p>
                <p className="mt-1 font-medium text-sm">{channel.value}</p>
              </div>
            )
            return channel.href ? (
              <a
                key={channel.label}
                href={channel.href}
                className="block hover:opacity-90"
              >
                {Content}
              </a>
            ) : (
              <div key={channel.label}>{Content}</div>
            )
          })}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-2">Soporte para clientes</h2>
          <p className="text-sm text-muted-foreground">
            Si ya eres cliente, también puedes contactarnos desde el panel.
            Atendemos en horario hábil de lunes a viernes.
          </p>
        </div>
      </section>
    </PublicLayout>
  )
}
