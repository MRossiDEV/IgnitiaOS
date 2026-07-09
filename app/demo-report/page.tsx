import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Lock,
  Share2,
  TrendingUp,
  Users,
  Search,
  Zap,
  Target,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import ExecutiveUpsell from "./ExecUpsell";

export default function ReportDemo() {
  return (
    <main className="min-h-screen bg-[#05070B] text-white">

      {/* Mobile App Header */}

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#05070B]/90 backdrop-blur">

        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-5">

          <div>
            <p className="text-xs text-zinc-500">
              Análisis Inteligente
            </p>

            <h1 className="font-semibold">
              Empresa Demo
            </h1>
          </div>

          <button className="rounded-xl border border-white/10 p-3">
            <Share2 size={18}/>
          </button>

        </div>

      </header>


      <div className="mx-auto max-w-xl space-y-5 px-5 py-6">


        {/* MAIN SCORE */}

        <section className="rounded-3xl bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-500/20 p-6">

          <div className="flex justify-between">

            <div>

              <p className="text-sm text-zinc-400">
                Salud Digital
              </p>

              <h2 className="mt-2 text-6xl font-bold">
                82
              </h2>

              <p className="mt-2 text-green-400">
                ↑ Buen potencial de mejora
              </p>

            </div>


            <BrainCircuit
              size={45}
              className="text-blue-400"
            />

          </div>


          <div className="mt-6 rounded-2xl bg-black/20 p-4">

            <p className="text-sm leading-6 text-zinc-300">

              "Tu empresa tiene una buena base digital,
              pero está perdiendo oportunidades de clientes
              por problemas de visibilidad y conversión."

            </p>

          </div>


        </section>



        {/* KEY METRICS */}

        <section className="grid grid-cols-2 gap-4">


          {[
            {
              icon:Search,
              title:"Visibilidad",
              value:"74%",
              color:"text-blue-400"
            },
            {
              icon:Users,
              title:"Conversión",
              value:"61%",
              color:"text-purple-400"
            },
            {
              icon:Target,
              title:"Competencia",
              value:"+8",
              color:"text-orange-400"
            },
            {
              icon:Zap,
              title:"Oportunidad",
              value:"Alta",
              color:"text-green-400"
            }

          ].map((item)=>{

            const Icon=item.icon;

            return (

              <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >

                <Icon
                size={22}
                className={item.color}
                />

                <p className="mt-5 text-sm text-zinc-400">
                  {item.title}
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {item.value}
                </p>

              </div>

            )

          })}


        </section>



        {/* AI FINDINGS */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">


          <div className="flex items-center gap-3">

            <TrendingUp className="text-blue-400"/>

            <h2 className="text-xl font-bold">
              Oportunidades Detectadas
            </h2>

          </div>


          <div className="mt-6 space-y-4">


          {[
            {
              title:"Aumentar tráfico orgánico",
              text:"Detectamos 14 palabras clave donde puedes competir."
            },
            {
              title:"Mejorar conversión",
              text:"Tu página pierde clientes por falta de llamados claros."
            },
            {
              title:"Superar competencia",
              text:"3 competidores están captando búsquedas importantes."
            }

          ].map((item)=>(

            <div
            key={item.title}
            className="rounded-2xl bg-black/20 p-4"
            >

              <h3 className="font-semibold">
                {item.title}
              </h3>

              <p className="mt-2 text-sm text-zinc-400">
                {item.text}
              </p>


            </div>

          ))}


          </div>


        </section>



        {/* QUICK WINS */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">


          <h2 className="text-xl font-bold">
            Acciones Recomendadas
          </h2>


          <div className="mt-5 space-y-3">


          {[
            "Optimizar páginas principales",
            "Crear contenido estratégico",
            "Mejorar experiencia móvil",
            "Implementar seguimiento de conversiones"
          ].map(item=>(

            <div
            key={item}
            className="flex gap-3 rounded-xl bg-white/5 p-4"
            >

              <CheckCircle2
              className="text-green-400"
              size={20}
              />

              <span className="text-sm">
                {item}
              </span>

            </div>

          ))}


          </div>


        </section>



        {/* UPSALE */}

        <section className="">                  
            <ExecutiveUpsell />
        </section>
      </div>
    </main>
  );
}