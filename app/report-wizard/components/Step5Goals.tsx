"use client";

import { useReportWizard } from "../store";
import {
  ArrowRight,
  Bot,
  DollarSign,
  Globe,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

const goals = [
  {
    title: "Conseguir más clientes",
    description: "Generar más consultas y oportunidades comerciales.",
    icon: Users,
    value: "Más clientes",
  },
  {
    title: "Aumentar mis ingresos",
    description: "Incrementar ventas y facturación.",
    icon: DollarSign,
    value: "Más ingresos",
  },
  {
    title: "Aparecer mejor en Google",
    description: "Mejorar el posicionamiento y atraer tráfico orgánico.",
    icon: Search,
    value: "SEO",
  },
  {
    title: "Mejorar mi sitio web",
    description: "Optimizar la experiencia y convertir más visitantes.",
    icon: Globe,
    value: "Sitio Web",
  },
  {
    title: "Automatizar procesos",
    description: "Ahorrar tiempo utilizando herramientas de IA.",
    icon: Bot,
    value: "Automatización",
  },
  {
    title: "Hacer crecer mi negocio",
    description: "Detectar nuevas oportunidades de crecimiento.",
    icon: TrendingUp,
    value: "Crecimiento",
  },
];

export default function Step5Goals() {
  const { update, next, previous } = useReportWizard();

  function select(goal: string) {
    update({
      primary_goal: goal,
    });

    setTimeout(() => {
      next();
    }, 200);
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      <div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Paso 4 de 9
        </span>

        <h1 className="mt-5 text-3xl font-bold leading-tight">
          ¿Cuál es tu principal objetivo?
        </h1>

        <p className="mt-3 leading-7 text-zinc-400">
          Adaptaremos el análisis y las recomendaciones según el resultado que buscas conseguir.
        </p>

      </div>

      <div className="mt-10 space-y-4">

        {goals.map((goal) => {

          const Icon = goal.icon;

          return (

            <button
              key={goal.value}
              onClick={() => select(goal.value)}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-all hover:border-blue-500 hover:bg-blue-500/10"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">

                <Icon
                  size={22}
                  className="text-blue-400"
                />

              </div>

              <div className="flex-1">

                <h2 className="font-semibold">
                  {goal.title}
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  {goal.description}
                </p>

              </div>

              <ArrowRight
                size={18}
                className="text-zinc-500 transition group-hover:translate-x-1"
              />

            </button>

          );

        })}

      </div>

      <button
        onClick={previous}
        className="mt-auto rounded-2xl border border-white/10 py-4 font-medium"
      >
        Atrás
      </button>

    </div>
  );
}