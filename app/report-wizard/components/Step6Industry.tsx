"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Search,
} from "lucide-react";

import { useReportWizard } from "../store";

const industries = [
  "Abogado",
  "Arquitecto",
  "Agencia de Marketing",
  "Contador",
  "Constructor",
  "Consultor",
  "Coach",
  "Clínica",
  "Dentista",
  "Diseñador",
  "Electricista",
  "Empresa de Limpieza",
  "Estudio Jurídico",
  "Fisioterapeuta",
  "Gimnasio",
  "Hotel",
  "Inmobiliaria",
  "Médico",
  "Psicólogo",
  "Restaurante",
  "Salón de Belleza",
  "Software / SaaS",
  "Tienda Online",
  "Veterinaria",
  "Otro",
];

export default function Step6Industry() {
  const { data, update, next, previous } = useReportWizard();

  const [search, setSearch] = useState(data.industry || "");

  const filtered = useMemo(() => {
    if (!search.trim()) return industries;

    return industries.filter((industry) =>
      industry.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  function select(industry: string) {
    update({
      industry,
    });

    setTimeout(next, 200);
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      <div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Paso 5 de 9
        </span>

        <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

          <Briefcase
            size={26}
            className="text-blue-400"
          />

        </div>

        <h1 className="mt-6 text-3xl font-bold leading-tight">
          ¿En qué sector trabajas?
        </h1>

        <p className="mt-3 leading-7 text-zinc-400">
          Compararemos tu negocio con empresas y profesionales de tu misma industria.
        </p>

      </div>

      {/* Search */}

      <div className="relative mt-8">

        <Search
          size={18}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500"
        />

        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar actividad..."
          className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-14 pr-5 outline-none transition focus:border-blue-500"
        />

      </div>

      {/* Results */}

      <div className="mt-6 flex-1 space-y-3 overflow-y-auto">

        {filtered.map((industry) => (

          <button
            key={industry}
            onClick={() => select(industry)}
            className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-all hover:border-blue-500 hover:bg-blue-500/10"
          >

            <span className="font-medium">
              {industry}
            </span>

            <CheckCircle2
              size={18}
              className="opacity-0 transition group-hover:opacity-100 text-blue-400"
            />

          </button>

        ))}

        {filtered.length === 0 && (

          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">

            <p className="text-zinc-400">
              No encontramos esa actividad.
            </p>

            <button
              onClick={() => select(search)}
              className="mt-4 inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
            >
              Utilizar "{search}"

              <ArrowRight
                size={16}
                className="ml-2"
              />

            </button>

          </div>

        )}

      </div>

      {/* Navigation */}

      <button
        onClick={previous}
        className="mt-6 rounded-2xl border border-white/10 py-4 font-medium"
      >
        Atrás
      </button>

    </div>
  );
}