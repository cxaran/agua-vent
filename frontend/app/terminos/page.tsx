import { FileText } from "lucide-react"
import { PublicLayout } from "@/components/public/public-layout"

export const metadata = {
  title: "Términos y condiciones · AguaVent",
}

export default function TermsPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-invert prose-sm">
        <div className="flex items-center gap-3 mb-6 not-prose">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold m-0">
            Términos y condiciones
          </h1>
        </div>

        <p className="text-muted-foreground text-sm">
          Última actualización: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">1. Aceptación</h2>
        <p className="text-sm text-muted-foreground">
          Al crear una cuenta y usar AguaVent aceptas estos términos. Si no estás
          de acuerdo, no utilices el servicio.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Cuenta y responsabilidad</h2>
        <p className="text-sm text-muted-foreground">
          Eres responsable de mantener la confidencialidad de tus credenciales y
          de toda actividad realizada bajo tu cuenta. Notifícanos de inmediato
          cualquier uso no autorizado.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Suscripción</h2>
        <p className="text-sm text-muted-foreground">
          El acceso a las funciones del sistema depende de una suscripción activa.
          Los pagos se cobran por adelantado por el periodo contratado. No hay
          devoluciones por periodos ya iniciados salvo acuerdo expreso.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Uso aceptable</h2>
        <p className="text-sm text-muted-foreground">
          No usarás AguaVent para fines ilícitos, ni intentarás vulnerar la
          seguridad del sistema. Nos reservamos el derecho de suspender cuentas
          que violen estas reglas.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Disponibilidad</h2>
        <p className="text-sm text-muted-foreground">
          Hacemos esfuerzos razonables para mantener el servicio disponible, pero
          no garantizamos disponibilidad ininterrumpida. Podemos realizar
          mantenimientos programados con aviso previo.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Cambios</h2>
        <p className="text-sm text-muted-foreground">
          Podemos actualizar estos términos. Publicaremos la nueva versión en
          esta página. El uso continuado del servicio implica aceptación de los
          cambios.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Contacto</h2>
        <p className="text-sm text-muted-foreground">
          Para dudas sobre estos términos, escríbenos a{" "}
          <a href="mailto:contacto@aguavent.mx" className="text-primary">
            contacto@aguavent.mx
          </a>
          .
        </p>
      </article>
    </PublicLayout>
  )
}
