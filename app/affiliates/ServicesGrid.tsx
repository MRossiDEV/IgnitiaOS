import {
  BadgeDollarSign,
  Briefcase,
  Building2,
  UserRound,
  Bot,
} from "lucide-react";

const services = [
  {
    title: "Reporte de Inteligencia Empresarial",
    price: "USD $99",
    commission: "30%",
    description:
      "Ideal para abrir conversaciones con nuevos clientes y detectar oportunidades.",
    icon: BadgeDollarSign,
  },
  {
    title: "Presencia Digital Profesional",
    price: "Desde USD $499",
    commission: "30%",
    description:
      "Construcción de marca personal, sitio web profesional y posicionamiento digital.",
    icon: UserRound,
  },
  {
    title: "Sistema de Crecimiento",
    price: "USD $999 + mensual",
    commission: "30% + recurrente",
    description:
      "Landing Page + CRM + Lead Wizard + Automatizaciones.",
    icon: Building2,
  },
  {
    title: "Empleado IA",
    price: "Desde USD $499/mes",
    commission: "10% mensual",
    description:
      "Agentes IA para ventas, soporte y marketing.",
    icon: Bot,
  },
  {
    title: "Sistema Empresarial IA",
    price: "Cotización",
    commission: "Hasta 15%",
    description:
      "Automatización completa para empresas medianas y grandes.",
    icon: Briefcase,
  },
];

export default function ServicesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">

      <div className="text-center">

        <h2 className="text-5xl font-bold">
          ¿Qué Puedes Vender?
        </h2>

        <p className="mt-6 text-lg text-zinc-400 max-w-3xl mx-auto">
          IgnitiaOS ofrece soluciones para empresas y profesionales.
          Tú eliges el cliente, nosotros hacemos el resto.
        </p>

      </div>

      <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

        {services.map((service) => {

          const Icon = service.icon;

          return (

            <div
              key={service.title}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 transition hover:border-blue-500 hover:-translate-y-2"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">

                <Icon className="h-7 w-7" />

              </div>

              <h3 className="mt-8 text-2xl font-semibold">
                {service.title}
              </h3>

              <p className="mt-4 text-zinc-400">
                {service.description}
              </p>

              <div className="mt-8 space-y-3">

                <div className="flex justify-between">

                  <span className="text-zinc-500">
                    Precio
                  </span>

                  <strong>
                    {service.price}
                  </strong>

                </div>

                <div className="flex justify-between">

                  <span className="text-zinc-500">
                    Comisión
                  </span>

                  <span className="rounded-full bg-green-600/20 px-3 py-1 text-green-400">

                    {service.commission}

                  </span>

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </section>
  );
}