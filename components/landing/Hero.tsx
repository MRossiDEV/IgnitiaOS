"use client";

import Link from "next/link";
import { ArrowRight, Play, CheckCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Fondo */}
      <div className="absolute inset-0 bg-[#09090B]" />

      <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[180px]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_60%)]" />

      {/* Cuadrícula */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pt-32 pb-24 text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        Servicios Empresariales Impulsados por Inteligencia Artificial
        </div>

        {/* Heading */}
        <h1 className="max-w-5xl text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
        Impulsamos el crecimiento
        <br />
          de tu empresa o marca profesional con soluciones de 
          <br />
        <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">          
          Inteligencia Artificial
        </span>
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400 md:text-xl">
          Convierte tu presencia digital en una máquina de generar clientes.
          <br />
          Analizamos tu presencia digital para descubrir oportunidades de crecimiento, mejorar tu posicionamiento y ayudarte a atraer más clientes mediante estrategias impulsadas por Inteligencia Artificial.
        </p>

        {/* CTA */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
        <Link
            href="/report-wizard"
            className="group inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-4 text-base font-semibold transition-all hover:bg-blue-500"
        >
            Obtener Análisis Inteligente Gratuito

            <ArrowRight
            className="ml-2 transition-transform group-hover:translate-x-1"
            size={18}
            />
        </Link>

        <Link
            href="/demo-report"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-7 py-4 text-base font-medium text-white backdrop-blur transition hover:border-white/20 hover:bg-white/10"
        >
            <Play className="mr-2" size={18} />
            Ver Reporte de Ejemplo
        </Link>
        </div>

        {/* Trust */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            Auditorías SEO
        </div>

        <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            Optimización Web
        </div>

        <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            Estrategias de Contenido
        </div>

        <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-500" />
            Automatización Empresarial
        </div>
              </div>
        </div>
    </section>
  );
}