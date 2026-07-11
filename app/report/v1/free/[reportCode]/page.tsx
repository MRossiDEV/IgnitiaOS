"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Globe,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

interface PageProps {
  params: {
    reportCode: string;
  };
}

export default function FreeReportPage({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    try {
      const res = await fetch(
        `/api/v1/reports/free/${params.reportCode}`,
        {
          cache: "no-store",
        }
      );

      if (!res.ok) {
        notFound();
        return;
      }

      const data = await res.json();

      setReport(data.report);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">

        <Loader2
          size={42}
          className="animate-spin text-blue-500"
        />

      </div>
    );
  }

  if (!report) return null;

  const analysis = report.analysis ?? {};

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-black pb-32">

      {/* HEADER */}

      <section className="sticky top-0 z-30 border-b border-white/10 bg-black/90 px-6 py-6 backdrop-blur-xl">

        <div className="flex items-center gap-3">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

            <BrainCircuit
              size={28}
              className="text-blue-400"
            />

          </div>

          <div>

            <p className="text-xs uppercase tracking-widest text-blue-400">
              Análisis Inteligente
            </p>

            <h1 className="text-xl font-bold">
              {report.business.name}
            </h1>

          </div>

        </div>

      </section>

      {/* SCORE */}

      <section className="px-6 pt-8">

        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/20 to-cyan-500/10 p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-zinc-400">
                Puntaje General
              </p>

              <h2 className="mt-2 text-6xl font-black text-white">
                {analysis.score ?? "--"}
              </h2>

              <p className="mt-2 text-blue-300">
                {analysis.level ?? "Analizando"}
              </p>

            </div>

            <TrendingUp
              size={52}
              className="text-blue-400"
            />

          </div>

        </div>

      </section>

      {/* AI SUMMARY */}

      <section className="px-6 pt-6">

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex items-center gap-3">

            <Sparkles
              size={20}
              className="text-blue-400"
            />

            <h2 className="font-semibold">
              Resumen IA
            </h2>

          </div>

          <p className="mt-5 leading-7 text-zinc-300">
            {analysis.summary}
          </p>

        </div>

      </section>

      {/* OPPORTUNITIES */}

      <section className="px-6 pt-6">

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex items-center gap-3">

            <BadgeCheck
              size={20}
              className="text-green-400"
            />

            <h2 className="font-semibold">
              Oportunidades detectadas
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            {(analysis.opportunities ?? []).map(
              (item: string) => (
                <div
                  key={item}
                  className="rounded-2xl bg-green-500/10 p-4"
                >
                  {item}
                </div>
              )
            )}

          </div>

        </div>

      </section>

      {/* ALERTS */}

      <section className="px-6 pt-6">

        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6">

          <div className="flex items-center gap-3">

            <TriangleAlert
              size={20}
              className="text-red-400"
            />

            <h2 className="font-semibold">
              Prioridades encontradas
            </h2>

          </div>

          <div className="mt-5 space-y-4">

            {(analysis.issues ?? []).map(
              (item: string) => (
                <div
                  key={item}
                  className="rounded-2xl bg-black/20 p-4"
                >
                  {item}
                </div>
              )
            )}

          </div>

        </div>

      </section>

      {/* WEBSITE */}

      <section className="px-6 pt-6">

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

          <div className="flex items-center gap-3">

            <Globe
              size={20}
              className="text-blue-400"
            />

            <h2 className="font-semibold">
              Sitio Web
            </h2>

          </div>

          <div className="mt-5 space-y-3 text-zinc-300">

            <div>
              <strong>URL:</strong>
              <br />
              {report.business.website || "No proporcionado"}
            </div>

            <div>
              <strong>Ubicación:</strong>
              <br />
              {report.business.location}
            </div>

            <div>
              <strong>Sector:</strong>
              <br />
              {report.business.industry}
            </div>

          </div>

        </div>

      </section>

      {/* PREMIUM TEASER */}

      <section className="px-6 pt-8">

        <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/15 to-cyan-500/5 p-6">

          <Search
            size={34}
            className="text-blue-400"
          />

          <h2 className="mt-5 text-2xl font-bold">
            Esto es solo el comienzo...
          </h2>

          <p className="mt-4 leading-7 text-zinc-300">

            El Informe Ejecutivo incluye:

          </p>

          <div className="mt-5 space-y-3 text-zinc-300">

            <div>✓ Auditoría SEO completa</div>

            <div>✓ Análisis de conversión</div>

            <div>✓ Comparación con competidores</div>

            <div>✓ Oportunidades priorizadas</div>

            <div>✓ Plan de acción de 90 días</div>

            <div>✓ Estrategia personalizada</div>

            <div>✓ Recomendaciones con IA</div>

          </div>

          <button className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-blue-600 font-semibold">

            Desbloquear Informe Ejecutivo

            <ArrowRight
              size={18}
              className="ml-2"
            />

          </button>

        </div>

      </section>

    </main>
  );
}