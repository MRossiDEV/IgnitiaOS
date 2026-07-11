import {
  Globe,
  BrainCircuit,
  FileSearch,
  TrendingUp,
} from "lucide-react";

const steps = [
  {
    icon: Globe,
    title: "1. Cuéntanos sobre tu negocio o marca personal.",
    description:
      "Completa un breve formulario con tu sitio web, objetivos y necesidades.",
  },
  {
    icon: BrainCircuit,
    title: "2. Analizamos tu presencia digital.",
    description:
      "Nuestros sistemas de IA realizan un análisis completo de tu presencia digital y detectan oportunidades de mejora.",
  },
  {
    icon: FileSearch,
    title: "3. Elaboramos tu estrategia",
    description:
      "Generamos un informe profesional con prioridades, recomendaciones y un plan de acción claro.",
  },
  {
    icon: TrendingUp,
    title: "4. Implementamos las mejoras",
    description:
      "Nuestro equipo ejecuta las optimizaciones para ayudarte a obtener resultados medibles.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-32 bg-[#09090B]">
      <div className="mx-auto max-w-7xl px-6">

        <div className="mx-auto mb-20 max-w-3xl text-center">

          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
            Cómo trabajamos
          </span>

          <h2 className="mt-6 text-4xl font-bold md:text-5xl">
            Un proceso simple, resultados profesionales.
          </h2>

          <p className="mt-6 text-lg leading-8 text-zinc-400">
            Nos encargamos del trabajo por ti. Desde el análisis inicial hasta
            las recomendaciones e implementación, cada paso está diseñado para
            generar valor para tu empresa.
          </p>

        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8"
              >

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
                  <Icon className="text-blue-400" size={28} />
                </div>

                <h3 className="text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-4 text-zinc-400 leading-7">
                  {step.description}
                </p>

              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}