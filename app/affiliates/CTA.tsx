"use client";

import { ArrowRight, Download, CalendarDays, CheckCircle2 } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-zinc-800 bg-gradient-to-b from-black via-zinc-950 to-black py-32">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#2563eb20_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-6">

        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* LEFT */}

          <div>

            <span className="rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
              IgnitiaOS Partner Program
            </span>

            <h2 className="mt-8 text-5xl font-bold leading-tight">
              Empieza a generar ingresos ayudando a empresas a crecer con IA.
            </h2>

            <p className="mt-8 text-lg leading-8 text-zinc-400">
              No necesitas ser desarrollador, diseñador ni experto en
              Inteligencia Artificial. Si sabes generar relaciones comerciales,
              nosotros hacemos el resto.
            </p>

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4">
                <CheckCircle2 className="text-green-400" />
                <span>Hasta 50% de comisión por venta.</span>
              </div>

              <div className="flex items-center gap-4">
                <CheckCircle2 className="text-green-400" />
                <span>Comisiones recurrentes por servicios mensuales.</span>
              </div>

              <div className="flex items-center gap-4">
                <CheckCircle2 className="text-green-400" />
                <span>Material comercial y capacitación incluidos.</span>
              </div>

              <div className="flex items-center gap-4">
                <CheckCircle2 className="text-green-400" />
                <span>Nosotros desarrollamos e implementamos los proyectos.</span>
              </div>

            </div>

            <div className="mt-12 flex flex-wrap gap-4">

              <button className="flex items-center gap-3 rounded-xl bg-white px-8 py-4 font-semibold text-black transition hover:bg-zinc-200">

                Aplicar Ahora

                <ArrowRight size={18} />

              </button>

              <button className="flex items-center gap-3 rounded-xl border border-zinc-700 px-8 py-4 transition hover:border-zinc-500">

                <Download size={18} />

                Descargar Brochure

              </button>

            </div>

          </div>

          {/* RIGHT */}

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">

            <h3 className="text-3xl font-bold">
              Solicitud de Partner
            </h3>

            <p className="mt-3 text-zinc-400">
              Completa el formulario y nuestro equipo se pondrá en contacto
              contigo en menos de 48 horas.
            </p>

            <form className="mt-8 space-y-5">

              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-blue-500"
              />

              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="País"
                className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-blue-500"
              />

              <input
                type="text"
                placeholder="Profesión"
                className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-blue-500"
              />

              <textarea
                rows={5}
                placeholder="Cuéntanos cómo piensas conseguir clientes..."
                className="w-full rounded-xl border border-zinc-700 bg-black px-5 py-4 outline-none transition focus:border-blue-500"
              />

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500"
              >
                Enviar Solicitud

                <ArrowRight size={18} />
              </button>

            </form>

            <div className="mt-8 rounded-2xl border border-zinc-800 bg-black p-5">

              <div className="flex items-center gap-3">

                <CalendarDays className="text-blue-400" />

                <div>

                  <div className="font-semibold">
                    ¿Prefieres hablar con nosotros?
                  </div>

                  <div className="text-sm text-zinc-400">
                    Agenda una reunión de 30 minutos con nuestro equipo.
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}