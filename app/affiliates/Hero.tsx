"use client";

import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-zinc-800">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1d4ed8_0%,transparent_60%)] opacity-20" />

      <div className="relative mx-auto max-w-7xl px-6 py-32">

        <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
          IgnitiaOS Partner Program
        </span>

        <h1 className="mt-8 max-w-4xl text-6xl font-bold leading-tight">
          Ayuda a Empresas a Crecer
          <br />
          Gana Comisiones Recurrentes.
        </h1>

        <p className="mt-8 max-w-2xl text-xl text-zinc-400">
          Tú consigues la relación.
          Nosotros entregamos toda la tecnología,
          implementación y soporte.
        </p>

        <div className="mt-10 flex gap-4">

          <button className="rounded-xl bg-white px-8 py-4 font-semibold text-black">
            Convertirme en Partner
          </button>

          <button className="rounded-xl border border-zinc-700 px-8 py-4">
            Descargar Brochure
          </button>

        </div>

      </div>

    </section>
  );
}