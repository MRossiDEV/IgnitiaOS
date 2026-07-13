"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Search,
} from "lucide-react";

import { useReportWizard } from "../store";

export default function Step3Website() {
  const { data, update, next, previous } = useReportWizard();

  const [website, setWebsite] = useState(data.website);

  function continueStep() {
    update({
      website: website.trim(),
    });

    // TODO:
    // Iniciar el crawler y los agentes de análisis
    // startWebsiteAudit(website)

    next();
  }

  function skipWebsite() {
    update({
      website: "none",
    });

    next();
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      <div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Paso 2 de 9
        </span>

        <h1 className="mt-5 text-3xl font-bold leading-tight">
          ¿Cuál es tu sitio web?
        </h1>

        <p className="mt-3 leading-7 text-zinc-400">
          Si tienes un sitio web comenzaremos a analizarlo inmediatamente
          mientras completas el resto del cuestionario.
        </p>

      </div>

      {/* Input */}

      <div className="mt-10">

        <label className="mb-3 block text-sm text-zinc-500">
          Sitio Web
        </label>

        <div className="flex h-16 items-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 focus-within:border-blue-500">

          <Globe
            size={20}
            className="text-zinc-500"
          />

          <input
            autoFocus
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://www.miempresa.com"
            className="ml-3 w-full bg-transparent text-lg outline-none placeholder:text-zinc-600"
          />

        </div>

      </div>

      {/* Analysis Preview */}

      <div className="mt-8 rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6">

        <div className="flex items-center gap-3">

          <Search
            size={20}
            className="text-blue-400"
          />

          <span className="font-semibold">
            Analizaremos automáticamente
          </span>

        </div>

        <div className="mt-6 space-y-3">

          {[
            "Experiencia de usuario",
            "Velocidad del sitio",
            "SEO y posicionamiento",
            "Versión móvil",
            "Seguridad",
            "Tecnologías utilizadas",
          ].map((item) => (

            <div
              key={item}
              className="flex items-center gap-3"
            >

              <CheckCircle2
                size={18}
                className="text-green-400"
              />

              <span className="text-zinc-300">
                {item}
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Skip */}

      <button
        onClick={skipWebsite}
        className="mt-6 text-left text-sm font-medium text-blue-400 hover:text-blue-300"
      >
        No tengo un sitio web
      </button>

      {/* Navigation */}

      <div className="mt-auto flex gap-3 pt-10">

        <button
          onClick={previous}
          className="flex-1 rounded-2xl border border-white/10 py-4 font-medium"
        >
          Atrás
        </button>

        <button
          onClick={continueStep}
          className="flex flex-1 items-center justify-center rounded-2xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500 active:scale-[0.98]"
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