import Link from "next/link";
import {
  Lock,
  ArrowRight,
  FileSearch,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export default function ExecutiveUpsell() {
  return (
    <section className="mt-6 rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-500/15 to-cyan-500/5 p-6">

        <div className="flex flex-col items-start gap-4">
            <div className="flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold">
                    Descubre todo el potencial 
                </h2>
                <h2 className="text-2xl font-bold text-blue-500">
                    de tu negocio
                </h2>
            </div>
              
            <div className="mt-2 text-sm leading-6 text-zinc-400">
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Este análisis gratuito detectó oportunidades iniciales.
                    El Informe Ejecutivo revela exactamente qué mejorar y dónde
                    concentrar tus esfuerzos.
                </p>
              </div> 
        </div>  


      <div className="mt-6 grid gap-3">

        {[
          {
            icon: FileSearch,
            text: "Análisis completo de tu presencia digital",
          },
          {
            icon: Users,
            text: "Comparación con tus principales competidores",
          },
          {
            icon: Target,
            text: "Plan de acción personalizado",
          },
          {
            icon: TrendingUp,
            text: "Estrategia de crecimiento priorizada",
          },
        ].map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.text}
              className="flex items-center gap-3 rounded-xl bg-black/20 p-3"
            >
              <Icon
                size={18}
                className="text-blue-400"
              />

              <span className="text-sm text-zinc-300">
                {item.text}
              </span>

            </div>
          );

        })}

      </div>


      <Link
        href="/informe-ejecutivo"
        className="mt-6 flex items-center justify-center rounded-xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500"
      >
        Obtener Informe Ejecutivo

        <ArrowRight
          size={18}
          className="ml-2"
        />

      </Link>

    </section>
  );
}