"use client";

import { useEffect, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useReportWizard } from "../store";

const tasks = [
  "Analizando tu sitio web...",
  "Detectando problemas técnicos...",
  "Evaluando experiencia móvil...",
  "Revisando velocidad de carga...",
  "Analizando posicionamiento SEO...",
  "Revisando presencia en Google...",
  "Evaluando autoridad de marca...",
  "Analizando generación de clientes...",
  "Detectando oportunidades de crecimiento...",
  "Comparando con negocios similares...",
  "Calculando potencial de ingresos...",
  "Preparando tu informe personalizado...",
];

export default function Step10Loading() {
  const { next } = useReportWizard();

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        next();
      }, 800);

      return () => clearTimeout(timeout);
    }

    const timer = setTimeout(() => {
      setProgress((value) => Math.min(value + 1, 100));
    }, 85);

    return () => clearTimeout(timer);
  }, [progress, next]);

  const completed = Math.floor((progress / 100) * tasks.length);

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      {/* Header */}

      <div className="text-center">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">

          <BrainCircuit
            size={42}
            className="animate-pulse text-blue-400"
          />

        </div>

        <h1 className="mt-8 text-3xl font-bold">
          Nuestra IA está trabajando
        </h1>

        <p className="mx-auto mt-4 max-w-sm leading-7 text-zinc-400">
          Estamos analizando tu presencia digital y preparando un diagnóstico personalizado.
        </p>

      </div>

      {/* Progress */}

      <div className="mt-10">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-sm text-zinc-500">
            Progreso del análisis
          </span>

          <span className="font-semibold text-blue-400">
            {progress}%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

      {/* Status */}

      <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">

        <div className="flex items-center gap-3">

          <Sparkles
            size={20}
            className="text-blue-400"
          />

          <div>

            <p className="font-semibold">
              Generando oportunidades de crecimiento
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              Cada análisis es realizado específicamente para tu negocio.
            </p>

          </div>

        </div>

      </div>

      {/* Tasks */}

      <div className="mt-8 flex-1 space-y-3">

        {tasks.map((task, index) => {
          const done = index < completed;
          const active = index === completed;

          return (
            <div
              key={task}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              {done ? (
                <CheckCircle2
                  size={20}
                  className="text-green-400"
                />
              ) : active ? (
                <Loader2
                  size={20}
                  className="animate-spin text-blue-400"
                />
              ) : (
                <div className="h-5 w-5 rounded-full border border-white/20" />
              )}

              <span
                className={
                  done
                    ? "text-zinc-200"
                    : active
                    ? "text-white"
                    : "text-zinc-500"
                }
              >
                {task}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}

      <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">

        <div className="flex items-center gap-3">

          <ShieldCheck
            size={20}
            className="text-green-400"
          />

          <p className="text-sm leading-6 text-zinc-300">
            Tu análisis está siendo procesado de forma segura y estará listo en unos segundos.
          </p>

        </div>

      </div>

    </div>
  );
}