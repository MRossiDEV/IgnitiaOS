import {
  Clock3,
  TrendingUp,
  Target,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const benefits = [
  {
    icon: Clock3,
    title: "Ahorra tiempo",
    description:
      "Reducimos semanas de análisis y planificación a solo unos días mediante procesos optimizados con IA.",
  },
  {
    icon: TrendingUp,
    title: "Enfocado en resultados",
    description:
      "Cada recomendación está orientada a aumentar tráfico, conversiones y oportunidades reales de negocio.",
  },
  {
    icon: Target,
    title: "Estrategias personalizadas",
    description:
      "No utilizamos plantillas genéricas. Cada proyecto se adapta a los objetivos y necesidades de tu empresa.",
  },
  {
    icon: BrainCircuit,
    title: "IA + Experiencia",
    description:
      "Combinamos inteligencia artificial con criterios profesionales para ofrecer soluciones prácticas y confiables.",
  },
  {
    icon: BarChart3,
    title: "Decisiones basadas en datos",
    description:
      "Analizamos información real para identificar oportunidades y definir las acciones con mayor impacto.",
  },
  {
    icon: ShieldCheck,
    title: "Acompañamiento continuo",
    description:
      "No entregamos únicamente un informe; te acompañamos durante todo el proceso de mejora.",
  },
];

export default function WhyIgnitia() {
  return (
    <section className="bg-[#09090B] py-32">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto max-w-3xl text-center">

          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            ¿Por qué elegir IgnitiaAI?
          </span>

          <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
            Más que un proveedor de servicios.
          </h2>

          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Trabajamos junto a empresas, profesionales independientes y marcas personales para identificar oportunidades, mejorar su presencia digital y acelerar su crecimiento.
          </p>

        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {benefits.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:border-blue-500/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Icon className="text-blue-400" size={28} />
                </div>

                <h3 className="mt-8 text-2xl font-semibold text-white">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-zinc-400">
                  {item.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}