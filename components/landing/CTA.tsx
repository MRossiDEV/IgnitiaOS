import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-32">

      <div className="absolute inset-0 bg-[#0B1020]" />

      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/15 blur-[150px]" />

      <div className="relative mx-auto max-w-5xl px-6">

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] px-8 py-16 text-center backdrop-blur-xl md:px-16">

            <h2 className="text-4xl font-bold text-white md:text-6xl">
            Descubre qué está frenando el crecimiento de tu negocio.
            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-400">
            Obtén un reporte gratuito generado por Inteligencia Artificial con un análisis
            inicial de tu empresa, oportunidades de mejora y recomendaciones
            personalizadas. Sin costo y sin compromiso.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">

            <Link
                href="/report-wizard"
                className="group inline-flex items-center rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold transition hover:bg-blue-500"
            >
                Obtener Reporte Gratuito

                <ArrowRight
                className="ml-2 transition-transform group-hover:translate-x-1"
                size={20}
                />

            </Link>

            <Link
                href="/demo-report"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-medium text-white transition hover:border-white/20 hover:bg-white/10"
            >
                Ver Reporte de Ejemplo
            </Link>

            </div>

        </div>

      </div>

    </section>
  );
}