import {
  Search,
  LineChart,
  FileText,
  Bot,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Search,
    title: "Auditorías Inteligentes",
    description:
      "Analizamos tu sitio web para detectar problemas técnicos, oportunidades de mejora y acciones prioritarias.",
  },
  {
    icon: LineChart,
    title: "Optimización SEO",
    description:
      "Mejoramos la visibilidad de tu negocio con estrategias enfocadas en posicionamiento y rendimiento.",
  },
  {
    icon: FileText,
    title: "Contenido Estratégico",
    description:
      "Creamos y optimizamos contenido pensado para atraer clientes y mejorar la conversión.",
  },
  {
    icon: Bot,
    title: "Automatización",
    description:
      "Implementamos soluciones impulsadas por IA para reducir tareas repetitivas y aumentar la productividad.",
  },
];

export default function TrustSection() {
  return (
    <section className="border-t border-white/10 bg-[#0C0F17] py-28">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto mb-20 max-w-3xl text-center">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            <ShieldCheck size={16} />
            Qué hacemos
          </div>

          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Servicios diseñados para generar resultados reales.
          </h2>

          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Combinamos Inteligencia Artificial con metodologías profesionales
            para ayudarte a mejorar tu presencia digital, optimizar procesos y
            descubrir nuevas oportunidades de crecimiento.
          </p>

        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-white/[0.05]"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Icon size={28} />
                </div>

                <h3 className="text-xl font-semibold text-white">
                  {service.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-zinc-400">
                  {service.description}
                </p>

                <Link
                  href="/servicios"
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition group-hover:gap-3"
                >
                  Conocer más

                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}