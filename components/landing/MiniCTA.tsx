import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function MiniCTA() {
  return (
    <section className="my-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

      <div className="flex items-center gap-3">

        <div className="rounded-xl bg-blue-500/10 p-3">
          <Sparkles
            className="text-blue-400"
            size={22}
          />
        </div>


        <div>

          <h3 className="font-semibold">
            ¿Quieres mejorar tus resultados?
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            Obtén recomendaciones personalizadas para tu negocio.
          </p>

        </div>

      </div>


      <Link
        href="/report-wizard"
        className="mt-5 flex items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 py-3 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
      >

        Análisis Inteligente Gratuito

        <ArrowRight
          size={16}
          className="ml-2"
        />

      </Link>


    </section>
  );
}