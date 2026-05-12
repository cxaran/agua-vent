import { ShieldCheck } from "lucide-react"
import { PublicLayout } from "@/components/public/public-layout"

export const metadata = {
  title: "Aviso de privacidad · AguaVent",
}

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-6 py-16 prose prose-invert prose-sm">
        <div className="flex items-center gap-3 mb-6 not-prose">
          <ShieldCheck className="h-7 w-7 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold m-0">
            Aviso de privacidad
          </h1>
        </div>

        <p className="text-muted-foreground text-sm">
          Última actualización: {new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">1. Datos que recolectamos</h2>
        <p className="text-sm text-muted-foreground">
          Recolectamos datos básicos para operar el servicio: nombre, correo,
          información del negocio (razón social, dirección, teléfono) y registros
          de uso (sesiones, IP, agente del navegador).
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">2. Cómo los usamos</h2>
        <p className="text-sm text-muted-foreground">
          Utilizamos tus datos para: proveer el servicio, facturar, dar soporte,
          mejorar el producto y cumplir obligaciones legales.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">3. Con quién los compartimos</h2>
        <p className="text-sm text-muted-foreground">
          No vendemos tus datos. Solo los compartimos con proveedores que nos
          ayudan a operar (correo, infraestructura, pagos) y con autoridades
          cuando la ley lo requiera.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">4. Cookies y sesión</h2>
        <p className="text-sm text-muted-foreground">
          Usamos una cookie de sesión (HTTP-only) para mantenerte autenticado.
          No usamos cookies de tracking publicitario.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">5. Tus derechos (ARCO)</h2>
        <p className="text-sm text-muted-foreground">
          Tienes derecho a acceder, rectificar, cancelar y oponerte al
          tratamiento de tus datos. Para ejercerlos, escríbenos a{" "}
          <a href="mailto:privacidad@aguavent.mx" className="text-primary">
            privacidad@aguavent.mx
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">6. Seguridad</h2>
        <p className="text-sm text-muted-foreground">
          Aplicamos medidas técnicas y administrativas razonables para proteger
          tus datos. Las contraseñas se almacenan con hashing seguro (Argon2).
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2">7. Cambios</h2>
        <p className="text-sm text-muted-foreground">
          Podemos actualizar este aviso. La fecha de última actualización
          aparece al inicio del documento.
        </p>
      </article>
    </PublicLayout>
  )
}
