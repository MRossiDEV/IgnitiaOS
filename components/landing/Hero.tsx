
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
        <div className="relative mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-20 p-4 items-center">
                <motion.div
                initial={{opacity:0,y:40}}
                animate={{opacity:1,y:0}}
                >

                <div className="inline-flex text-sm items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-blue-300">
                    <Sparkles size={12}/>
                    TU DEPARTAMENTO EXTERNO DE CRECIMIENTO
                </div>
                      
                <div className="flex items-center max-w-[400px] gap-3">
                    <img
                        src="/images/brand/logo.png"
                        className="mt-8 h-auto w-full"
                    />              
                </div>



                <h1 className="mt-8 text-4xl md:text-4xl font-black leading-[1.05]">
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

                <div className="rounded-[30px] border border-blue-500/20 bg-white/5 backdrop-blur-xl p-8">

                    <h3 className="text-3xl font-bold">
                        Auditoría Gratuita
                    </h3>

                    <p className="mt-3 text-zinc-400">
                        Analizamos tu presencia online, y te mostramos exactamente dónde estás perdiendo de generar potenciales ganancias, y cómo llegar a más clientes.
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
        </div>
    </section>
  );
}