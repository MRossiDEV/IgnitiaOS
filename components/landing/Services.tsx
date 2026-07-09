import Link from "next/link";
import {
  ArrowRight,
  SearchCheck,
  Globe,
  FileText,
  LineChart,
  ShieldCheck,
  Bot,
} from "lucide-react";

const services = [
  {
    icon: SearchCheck,
    title: "Auditoría SEO",
    description:
      "Detectamos errores técnicos, oportunidades de posicionamiento y acciones prioritarias para mejorar tu visibilidad.",
  },
  {
    icon: Globe,
    title: "Optimización Web",
    description:
      "Mejoramos la velocidad, experiencia de usuario y estructura de tu sitio para aumentar conversiones.",
  },
  {
    icon: FileText,
    title: "Contenido Estratégico",
    description:
      "Creamos y optimizamos contenido orientado a buscadores y pensado para convertir visitantes en clientes.",
  },
  {
    icon: LineChart,
    title: "Análisis de Competencia",
    description:
      "Estudiamos a tus competidores para descubrir oportunidades y ventajas que puedas aprovechar.",
  },
  {
    icon: ShieldCheck,
    title: "Monitoreo Continuo",
    description:
      "Supervisamos el rendimiento de tu negocio y detectamos nuevos problemas antes de que afecten tus resultados.",
  },
  {
    icon: Bot,
    title: "Automatización Inteligente",
    description:
      "Implementamos soluciones de IA para reducir tareas repetitivas y optimizar procesos internos.",
  },
];

export default function Services() {
  return (
    <section className="bg-[#0B0F18] py-32">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-3xl text-center">

          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            Nuestros Servicios
          </span>

          <h2 className="mt-6 text-4xl font-bold md:text-5xl">
            Todo lo que necesitas para impulsar tu negocio.
          </h2>

          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Cada servicio está diseñado para resolver un problema específico y
            generar resultados medibles. Puedes contratar un servicio puntual o
            una estrategia completa adaptada a tu empresa.
          </p>

        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                key={service.title}
                className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <Icon size={28} />
                </div>

                <h3 className="mt-8 text-2xl font-semibold text-white">
                  {service.title}
                </h3>

                <p className="mt-4 leading-7 text-zinc-400">
                  {service.description}
                </p>

                <Link
                  href="/servicios"
                  className="mt-8 inline-flex items-center gap-2 font-medium text-blue-400 transition-all group-hover:gap-3"
                >
                  Más información

                  <ArrowRight size={18} />
                </Link>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}