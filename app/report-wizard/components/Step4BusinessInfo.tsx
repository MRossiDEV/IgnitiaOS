"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Users,
} from "lucide-react";

import { useReportWizard } from "../store";

const businessSizes = [
  "Solo yo",
  "1 - 5 empleados",
  "6 - 20 empleados",
  "21 - 50 empleados",
  "Más de 50 empleados",
];

export default function Step4BusinessInfo() {
  const { data, update, next, previous } = useReportWizard();

  const [form, setForm] = useState({
    businessName: data.businessName,    
    city: data.city,
    country: data.country,
    businessSize: data.businessSize,
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function continueStep() {
    update(form);
    next();
  }

  const canContinue =
    form.businessName.trim() &&    
    form.city.trim() &&
    form.country.trim() &&
    form.businessSize;

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      <div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Paso 3 de 9
        </span>

        <h1 className="mt-5 text-3xl font-bold leading-tight">
          Cuéntanos sobre tu negocio
        </h1>

        <p className="mt-3 leading-7 text-zinc-400">
          Esta información nos permitirá comparar tu negocio con otros similares
          y generar un análisis mucho más preciso.
        </p>

      </div>

      <div className="mt-10 space-y-5">

        <div>

          <label className="mb-2 block text-sm text-zinc-500">
            Nombre del negocio
          </label>

          <div className="flex h-16 items-center rounded-2xl border border-white/10 bg-white/[0.03] px-5 focus-within:border-blue-500">

            <Building2
              size={20}
              className="text-zinc-500"
            />

            <input
              autoFocus
              value={form.businessName}
              onChange={(e) =>
                updateField("businessName", e.target.value)
              }
              placeholder="Ej. Clínica Dental López"
              className="ml-3 w-full bg-transparent outline-none placeholder:text-zinc-600"
            />

          </div>

        </div>



        <div className="grid grid-cols-2 gap-4">

          <div>

            <label className="mb-2 block text-sm text-zinc-500">
              Ciudad
            </label>

            <input
              value={form.city}
              onChange={(e) =>
                updateField("city", e.target.value)
              }
              placeholder="Montevideo"
              className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 outline-none transition focus:border-blue-500"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-zinc-500">
              País
            </label>

            <input
              value={form.country}
              onChange={(e) =>
                updateField("country", e.target.value)
              }
              placeholder="Uruguay"
              className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 outline-none transition focus:border-blue-500"
            />

          </div>

        </div>

        <div>

          <label className="mb-3 block text-sm text-zinc-500">
            Tamaño del negocio
          </label>

          <div className="grid gap-3">

            {businessSizes.map((size) => {

              const active = form.businessSize === size;

              return (

                <button
                  key={size}
                  type="button"
                  onClick={() => updateField("businessSize", size)}
                  className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/[0.03] hover:border-blue-500"
                  }`}
                >

                  <Users
                    size={18}
                    className="text-blue-400"
                  />

                  <span>{size}</span>

                </button>

              );

            })}

          </div>

        </div>

      </div>

      <div className="mt-auto flex gap-3 pt-10">

        <button
          onClick={previous}
          className="flex-1 rounded-2xl border border-white/10 py-4 font-medium"
        >
          Atrás
        </button>

        <button
          disabled={!canContinue}
          onClick={continueStep}
          className="flex flex-1 items-center justify-center rounded-2xl bg-blue-600 py-4 font-semibold transition disabled:opacity-40"
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