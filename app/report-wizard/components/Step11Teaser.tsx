"use client";

import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Lock,
  TrendingUp,
  Zap,
} from "lucide-react";

import { useReportWizard } from "../store";

const findings = [
  "Encontramos 27 oportunidades potenciales de mejora.",
  "Detectamos varios puntos de fricción que podrían estar reduciendo tus consultas.",
  "Identificamos oportunidades de posicionamiento que actualmente no estás aprovechando.",
  "Encontramos áreas donde tu competencia podría estar captando clientes antes que tú.",
  "Detectamos acciones de alto impacto que podrían implementarse rápidamente.",
];

export default function Step11Teaser() {
  const { next } = useReportWizard();

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      {/* Hero */}

      <div className="text-center">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-cyan-500/10">

          <BrainCircuit
            size={44}
            className="text-blue-400"
          />

        </div>

        <span className="mt-6 inline-flex rounded-full bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-400">
          ✓ Análisis completado
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-tight">
          Tu reporte ya está listo
        </h1>

        <p className="mx-auto mt-4 max-w-sm leading-7 text-zinc-400">
          Nuestra IA terminó de analizar tu presencia digital y encontró varias
          oportunidades que podrían ayudarte a generar más clientes.
        </p>

      </div>

      {/* Preview */}

      <div className="mt-10 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-6">

        <div className="flex items-center gap-3">

          <TrendingUp
            size={22}
            className="text-blue-400"
          />

          <h2 className="font-semibold">
            Lo que encontramos
          </h2>

        </div>

        <div className="mt-6 space-y-4">

          {findings.map((item) => (

            <div
              key={item}
              className="flex items-start gap-3"
            >

              <CheckCircle2
                size={20}
                className="mt-1 shrink-0 text-green-400"
              />

              <p className="leading-6 text-zinc-300">
                {item}
              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Locked */}

      <div className="mt-8 rounded-3xl border border-amber-500/20 bg-amber-500/5 p-6">

        <div className="flex items-center gap-3">

          <Lock
            size={22}
            className="text-amber-400"
          />

          <h2 className="font-semibold">
            Información desbloqueable
          </h2>

        </div>

        <div className="mt-5 space-y-4 text-zinc-300">

          <div className="flex items-center gap-3">
            <Zap
              size={18}
              className="text-blue-400"
            />
            <span>Puntaje completo de tu presencia digital.</span>
          </div>

          <div className="flex items-center gap-3">
            <Zap
              size={18}
              className="text-blue-400"
            />
            <span>Problemas específicos encontrados en tu sitio.</span>
          </div>

          <div className="flex items-center gap-3">
            <Zap
              size={18}
              className="text-blue-400"
            />
            <span>Comparación con negocios similares.</span>
          </div>

          <div className="flex items-center gap-3">
            <Zap
              size={18}
              className="text-blue-400"
            />
            <span>Acciones prioritarias para conseguir más clientes.</span>
          </div>

          <div className="flex items-center gap-3">
            <Zap
              size={18}
              className="text-blue-400"
            />
            <span>Recomendaciones personalizadas generadas por IA.</span>
          </div>

        </div>

      </div>

      {/* CTA */}

      <div className="mt-auto pt-10">

        <button
          onClick={next}
          className="flex h-16 w-full items-center justify-center rounded-2xl bg-blue-600 text-lg font-semibold transition hover:bg-blue-500 active:scale-[0.99]"
        >

          Desbloquear mi reporte

          <ArrowRight
            size={20}
            className="ml-2"
          />

        </button>

        <p className="mt-4 text-center text-sm text-zinc-500">
          En el siguiente paso te enviaremos un enlace privado para acceder a tu análisis.
        </p>

      </div>

    </div>
  );
}