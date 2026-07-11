"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react";

import { useReportWizard } from "../store";

export default function Step1Welcome() {
  const { next } = useReportWizard();

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-8">

      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-8">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">

          <Sparkles
            size={32}
            className="text-blue-400"
          />

        </div>

        <h1 className="mt-8 text-4xl font-bold leading-tight">
          Análisis
          <br />
          Inteligente
          <br />
          Gratuito
        </h1>

        <p className="mt-5 leading-7 text-zinc-400">
          Analizamos tu presencia digital para descubrir oportunidades
          reales de crecimiento, captar más clientes y aumentar tus
          ingresos.
        </p>

        <div className="mt-8 space-y-4">

          <div className="flex items-center gap-3">

            <CheckCircle2
              size={20}
              className="text-green-400"
            />

            <span className="text-zinc-300">
              Sitio Web y Experiencia de Usuario
            </span>

          </div>

          <div className="flex items-center gap-3">

            <CheckCircle2
              size={20}
              className="text-green-400"
            />

            <span className="text-zinc-300">
              SEO y Visibilidad en Google
            </span>

          </div>

          <div className="flex items-center gap-3">

            <CheckCircle2
              size={20}
              className="text-green-400"
            />

            <span className="text-zinc-300">
              Redes Sociales y Marca Personal
            </span>

          </div>

          <div className="flex items-center gap-3">

            <CheckCircle2
              size={20}
              className="text-green-400"
            />

            <span className="text-zinc-300">
              Oportunidades para conseguir más clientes
            </span>

          </div>

        </div>

        <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">

          <div className="flex items-center gap-3 text-sm">

            <Clock3
              size={18}
              className="text-blue-400"
            />

            <span className="text-zinc-300">
              Solo toma <strong>2 minutos</strong> completar el análisis.
            </span>

          </div>

        </div>

      </div>

      <button
        onClick={next}
        className="mt-8 flex h-16 items-center justify-center rounded-2xl bg-blue-600 text-lg font-semibold transition hover:bg-blue-500 active:scale-[0.98]"
      >
        Comenzar Análisis

        <ArrowRight
          size={20}
          className="ml-2"
        />

      </button>

      <p className="mt-4 text-center text-sm text-zinc-500">
        Sin costo • Sin compromiso • Reporte personalizado por IA
      </p>

    </div>
  );
}