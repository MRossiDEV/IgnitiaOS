import {
  Building2,
  Stethoscope,
  Scale,
  Wrench,
  Home,
  Dumbbell,
  Briefcase,
  GraduationCap,
  Store,
  Laptop,
  Hotel,
  Camera,
} from "lucide-react";

const clients = [
  {
    title: "Profesionales",
    description: "Abogados, contadores, arquitectos, consultores...",
    icon: Briefcase,
  },
  {
    title: "Médicos y Clínicas",
    description: "Consultorios, odontólogos, psicólogos...",
    icon: Stethoscope,
  },
  {
    title: "Inmobiliarias",
    description: "Captación de clientes y automatización.",
    icon: Home,
  },
  {
    title: "Constructoras",
    description: "Generación de presupuestos y leads.",
    icon: Building2,
  },
  {
    title: "Comercios",
    description: "Tiendas físicas y online.",
    icon: Store,
  },
  {
    title: "Gimnasios",
    description: "Captación de socios y automatización.",
    icon: Dumbbell,
  },
  {
    title: "Estudios Jurídicos",
    description: "Presencia digital y adquisición de clientes.",
    icon: Scale,
  },
  {
    title: "Hoteles",
    description: "Reservas y atención automatizada.",
    icon: Hotel,
  },
  {
    title: "Técnicos",
    description: "Electricistas, plomeros, instaladores...",
    icon: Wrench,
  },
  {
    title: "Academias",
    description: "Cursos y educación online.",
    icon: GraduationCap,
  },
  {
    title: "Agencias",
    description: "Expandir servicios con IA.",
    icon: Laptop,
  },
  {
    title: "Fotógrafos",
    description: "Marca personal y captación de clientes.",
    icon: Camera,
  },
];

export default function IdealClients() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center max-w-3xl mx-auto">

          <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            Oportunidades
          </span>

          <h2 className="mt-8 text-5xl font-bold">
            Casi Todos los Negocios Pueden Beneficiarse de la IA
          </h2>

          <p className="mt-6 text-lg text-zinc-400">
            No necesitas buscar empresas tecnológicas.
            Nuestro cliente ideal es cualquier empresa o profesional
            que quiera conseguir más clientes, ahorrar tiempo
            o mejorar su presencia digital.
          </p>

        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {clients.map((client) => {

            const Icon = client.icon;

            return (

              <div
                key={client.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 transition hover:-translate-y-2 hover:border-blue-500"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600">

                  <Icon className="h-7 w-7" />

                </div>

                <h3 className="mt-6 text-xl font-semibold">

                  {client.title}

                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-400">

                  {client.description}

                </p>

              </div>

            );

          })}

        </div>

        <div className="mt-16 rounded-3xl border border-blue-500/30 bg-blue-500/10 p-10">

          <h3 className="text-3xl font-bold">
            💡 Un solo cliente puede abrir muchas puertas.
          </h3>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-zinc-300">
            Un contador puede recomendarte a todos sus clientes.
            Un fotógrafo conoce decenas de empresas.
            Un diseñador trabaja con negocios todos los meses.
            Una inmobiliaria habla diariamente con empresarios.
            La mayoría de las personas ya tiene una red de contactos que
            puede convertirse en oportunidades de negocio.
          </p>

        </div>

      </div>
    </section>
  );
}