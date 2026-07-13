"use client";

import { useState } from "react";
import { useReportWizard } from "../store";
import {
  AlertCircle,
  ArrowRight,
  Check,
  TrendingUp,
} from "lucide-react";

const challenges = [
  "Consigo pocos clientes nuevos",
  "Mi sitio web no genera consultas",
  "No aparezco bien en Google",
  "Mi competencia tiene más presencia online",
  "Recibo pocas llamadas o mensajes",
  "Mis redes sociales no generan resultados",
  "No tengo una estrategia de marketing",
  "Pierdo tiempo en tareas repetitivas",
  "No convierto suficientes visitantes en clientes",
  "No sé cuál es el siguiente paso para crecer",
  "Quiero descubrir oportunidades de crecimiento",
];

export default function Step7Challenges() {
  const { data, update, next, previous } = useReportWizard();

  const [selected, setSelected] = useState<string[]>(
    data.biggest_challenge || []
  );

  function toggle(option: string) {
    if (selected.includes(option)) {
      setSelected(selected.filter((item) => item !== option));
      return;
    }

    if (selected.length >= 3) return;

    setSelected([...selected, option]);
  }

  function continueStep() {
    update({
      biggest_challenge: selected,
    });

    next();
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      <div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Paso 6 de 9
        </span>

        <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

          <TrendingUp
            size={26}
            className="text-blue-400"
          />

        </div>

        <h1 className="mt-6 text-3xl font-bold leading-tight">
          ¿Cuál es tu mayor desafío actualmente?
        </h1>

        <p className="mt-3 leading-7 text-zinc-400">
          Selecciona hasta <strong>3 opciones</strong>. Esto permitirá que la IA
          priorice las oportunidades más importantes para tu negocio.
        </p>

      </div>

      <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">

        <div className="flex items-center gap-3">

          <AlertCircle
            size={18}
            className="text-blue-400"
          />

          <span className="text-sm text-zinc-300">
            {selected.length} de 3 seleccionadas
          </span>

        </div>

      </div>

      <div className="mt-6 flex-1 space-y-3">

        {challenges.map((challenge) => {

          const active = selected.includes(challenge);

          return (

            <button
              key={challenge}
              onClick={() => toggle(challenge)}
              className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition-all ${
                active
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 bg-white/[0.03] hover:border-blue-500"
              }`}
            >

              <span className="pr-4 font-medium leading-6">
                {challenge}
              </span>

              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                  active
                    ? "bg-blue-600"
                    : "border border-white/20"
                }`}
              >
                {active && (
                  <Check size={16} />
                )}
              </div>

            </button>

          );

        })}

      </div>

      <div className="mt-auto flex gap-3 pt-8">

        <button
          onClick={previous}
          className="flex-1 rounded-2xl border border-white/10 py-4 font-medium"
        >
          Atrás
        </button>

        <button
          disabled={selected.length === 0}
          onClick={continueStep}
          className="flex flex-1 items-center justify-center rounded-2xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500 disabled:opacity-40"
        >
          Continuar

          <ArrowRight
            size={18}
            className="ml-2"
          />

        </button>

      </div>

    </div>
  );
}