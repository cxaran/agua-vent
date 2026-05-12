import Link from "next/link"
import { Droplets } from "lucide-react"

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Droplets className="h-6 w-6 text-primary" />
            <span className="text-base font-bold">AguaVent</span>
          </Link>
          <p className="mt-3 text-muted-foreground">
            Sistema de punto de venta para purificadoras de agua.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Producto</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/login" className="hover:text-foreground">
                Iniciar sesión
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-foreground">
                Crear cuenta
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Empresa</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/sobre-nosotros" className="hover:text-foreground">
                Sobre nosotros
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:text-foreground">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Legal</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link href="/terminos" className="hover:text-foreground">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-foreground">
                Aviso de privacidad
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} AguaVent. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
