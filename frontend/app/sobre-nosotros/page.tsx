import { Droplets, Target, Eye, HeartHandshake } from "lucide-react"
import { PublicLayout } from "@/components/public/public-layout"

const VALUES = [
  {
    icon: Target,
    title: "Misión",
    description:
      "Acompañar a las purificadoras con un sistema confiable que les permita crecer, operar con orden y entender su negocio en tiempo real.",
  },
  {
    icon: Eye,
    title: "Visión",
    description:
      "Ser la plataforma de referencia para el sector del agua purificada en México, integrando ventas, logística y administración en una sola herramienta.",
  },
  {
    icon: HeartHandshake,
    title: "Valores",
    description:
      "Cercanía con el cliente, foco en el oficio, soporte humano y mejora continua del producto.",
  },
]

export const metadata = {
  title: "Sobre nosotros · AguaVent",
}

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <Droplets className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold">Sobre nosotros</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          AguaVent nace de la experiencia diaria en purificadoras de agua y de la
          necesidad de contar con un sistema diseñado específicamente para este
          negocio, no un POS genérico.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <value.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-semibold mb-2">{value.title}</h2>
              <p className="text-sm text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  )
}
