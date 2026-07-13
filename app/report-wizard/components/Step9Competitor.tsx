"use client";

import { useState } from "react";
import {
  ArrowRight,
  Search,
  Trophy,
} from "lucide-react";

import { useReportWizard } from "../store";

export default function Step9Competitor() {
  const { data, update, next, previous, setReport } = useReportWizard();
  const [competitor, setCompetitor] = useState(data.competitors); 
  
  async function continueStep() {
    try {
      const wizardData = {
        ...data,
        competitors: competitor,
      };

      update({
        competitors: competitor,
      });

      console.log("wizardData", wizardData);


      const response = await fetch("/api/v1/reports/free", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wizardData),
      });

      if (!response.ok) {
        throw new Error("Failed to start report");
      }

      const report = await response.json();



      next();

    } catch (err) {
      console.error(err);
    }
  }

  // SKIP 
  async function skipStep() {
    try {
      const wizardData = {
        ...data,
        competitors: competitor,
      };

      update({
        competitors: "No conozco mi competencia",
      });

      const response = await fetch("/api/v1/reports/free/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wizardData),
      });

      if (!response.ok) {
        throw new Error("Failed to start report");
      }

      const report = await response.json();

      setReport(
        report.reportId,
        report.accessCode
      );

      next();

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      <div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Paso 8 de 9
        </span>

        <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

          <Trophy
            size={26}
            className="text-blue-400"
          />

        </div>

        <h1 className="mt-6 text-3xl font-bold leading-tight">
          ¿Conoces a tu principal competidor?
        </h1>

        <p className="mt-3 leading-7 text-zinc-400">
          Si nos indicas un competidor podremos comparar su presencia digital
          con la tuya y detectar oportunidades que quizás estés perdiendo.
        </p>

      </div>

      {/* Input */}

      <div className="mt-10">

        <label className="mb-3 block text-sm text-zinc-500">
          Nombre o sitio web del competidor
        </label>

        <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.03] px-5">

          <Search
            size={20}
            className="text-zinc-500"
          />

          <input
            autoFocus
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            placeholder="Ej. www.empresa.com o Clínica ABC"
            className="h-16 w-full bg-transparent px-4 outline-none placeholder:text-zinc-600"
          />

        </div>

      </div>

      {/* Info */}

      <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">

        <h3 className="font-semibold">
          ¿Qué analizaremos?
        </h3>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-300">
          <li>• Posicionamiento en Google.</li>
          <li>• Presencia digital.</li>
          <li>• Sitio web y experiencia de usuario.</li>
          <li>• Oportunidades que tu competencia está aprovechando.</li>
        </ul>

      </div>

      {/* Skip */}

      <button
        onClick={skipStep}
        className="mt-6 text-left text-sm font-medium text-blue-400 transition hover:text-blue-300"
      >
        No conozco a mi competencia →
      </button>

      {/* Navigation */}

      <div className="mt-auto flex gap-3 pt-8">

        <button
          onClick={previous}
          className="flex-1 rounded-2xl border border-white/10 py-4 font-medium"
        >
          Atrás
        </button>

        <button
          onClick={continueStep}
          className="flex flex-1 items-center justify-center rounded-2xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500"
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