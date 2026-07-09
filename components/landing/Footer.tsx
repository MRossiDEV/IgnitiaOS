import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#09090B]">

      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-12 md:grid-cols-4">

          <div>

            <h3 className="text-2xl font-bold text-white">
              IgnitiaAI
            </h3>

            <p className="mt-4 leading-7 text-zinc-400">
              Servicios empresariales impulsados por Inteligencia Artificial para
              ayudar a las empresas a crecer con tecnología de última generación.
            </p>

          </div>

          <div>

            <h4 className="font-semibold text-white">
              Servicios
            </h4>

            <div className="mt-5 flex flex-col gap-3 text-zinc-400">

              <Link href="/servicios">
                Auditorías
              </Link>

              <Link href="/servicios">
                SEO
              </Link>

              <Link href="/servicios">
                Automatización
              </Link>

              <Link href="/servicios">
                Estrategias
              </Link>

            </div>

          </div>

          <div>

            <h4 className="font-semibold text-white">
              Empresa
            </h4>

            <div className="mt-5 flex flex-col gap-3 text-zinc-400">

              <Link href="/nosotros">
                Nosotros
              </Link>

              <Link href="/contacto">
                Contacto
              </Link>

              <Link href="/blog">
                Blog
              </Link>

            </div>

          </div>

          <div>

            <h4 className="font-semibold text-white">
              Legal
            </h4>

            <div className="mt-5 flex flex-col gap-3 text-zinc-400">

              <Link href="/privacidad">
                Política de Privacidad
              </Link>

              <Link href="/terminos">
                Términos y Condiciones
              </Link>

            </div>

          </div>

        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 text-sm text-zinc-500 md:flex-row">

          <p>
            © 2026 IgnitiaAI. Todos los derechos reservados.
          </p>

          <p>
            Desarrollado con Inteligencia Artificial.
          </p>

        </div>

      </div>

    </footer>
  );
}