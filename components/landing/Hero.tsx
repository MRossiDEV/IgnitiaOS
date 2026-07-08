
"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/hero/business-team.jpg"
            className="h-full w-full object-cover opacity-15"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#05070b]/60 via-[#05070b]/90 to-[#05070b]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2563eb20,transparent_70%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl pt-20">
            <div className="grid lg:grid-cols-2 gap-20 p-4 items-center">
                <motion.div
                initial={{opacity:0,y:40}}
                animate={{opacity:1,y:0}}
                >

                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-blue-300">
                    <Sparkles size={16}/>
                    TU DEPARTAMENTO EXTERNO DE CRECIMIENTO
                </div>

                <img
                    src="/images/brand/logo.png"
                    className="mt-8 h-36"
                />

                <h1 className="mt-8 text-6xl md:text-7xl font-black leading-[1.05]">
                    Construimos
                    <br/>
                    <span className="text-blue-500">
                    tu sistema
                    </span>
                    <br/>
                    de crecimiento.
                </h1>

                <p className="mt-8 max-w-xl text-xl text-zinc-400 leading-9">
                    Ignitia AI, actúa como tu equipo completo de crecimiento.
                    Generamos clientes potenciales, desarrollamos sitios web,
                    automatizamos procesos, implementamos IA y optimizamos tu negocio
                    para que tú puedas concentrarte en vender.
                </p>

                <div className="mt-10 flex flex-wrap gap-5">

                    <button className="rounded-2xl bg-blue-600 px-8 py-5 font-bold hover:bg-blue-500 flex items-center gap-3">

                    Solicitar Auditoría Gratuita

                    <ArrowRight/>

                    </button>

                    <button className="rounded-2xl border border-white/10 px-8 py-5 hover:bg-white/5">

                    Agendar Reunión

                    </button>

                </div>

                <div className="mt-12 grid grid-cols-2 gap-5 text-sm">

                    <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-blue-400"/>
                    Nosotros hacemos el trabajo
                    </div>

                    <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-blue-400"/>
                    Tú obtienes resultados
                    </div>

                    <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-blue-400"/>
                    IA + Automatización
                    </div>

                    <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-blue-400"/>
                    Equipo multidisciplinario
                    </div>

                </div>

                </motion.div>

                <motion.div
                initial={{opacity:0,scale:.95}}
                animate={{opacity:1,scale:1}}
                >

                <div className="rounded-[36px] border border-blue-500/20 bg-white/5 backdrop-blur-xl p-8">

                    <h3 className="text-3xl font-bold">

                    Auditoría Gratuita

                    </h3>

                    <p className="mt-3 text-zinc-400">

                    Analizamos tu negocio y te mostramos exactamente cómo
                    generar más clientes utilizando nuestro sistema.

                    </p>

                    <div className="space-y-5 mt-8">

                    <input
                        placeholder="Nombre"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-blue-500"
                    />

                    <input
                        placeholder="Empresa"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-blue-500"
                    />

                    <input
                        placeholder="Email"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-blue-500"
                    />

                    <input
                        placeholder="Sitio Web"
                        className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 outline-none focus:border-blue-500"
                    />

                    <button className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-5 font-bold">

                        Solicitar Auditoría →

                    </button>

                    </div>

                </div>

                </motion.div>
            </div>
              
            <div className="flex mt-10">
                <div className="bg-blue-600 backdrop-blur-xl w-4/5 h-20 text-zinc-900 text-xl flex justify-center">
                    <div className="my-auto">
                        INNOVAMOS HOY, AUTOMATIZAMOS EL MAÑANA.
                    </div>
                    <div className="my-auto text-blue-400">
                      TRANSFORMAMOS TU NEGOCIO.
                    </div>

                </div>

                <div className="bg-gray-600 backdrop-blur-xl w-1/5 h-20 text-blue-600 text-xl flex font-bold justify-center">
                    <div className="my-auto">
                        IgnitiaOS
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}