export default function ComparisonTable() {
  const rows = [
    {
      task: "Encontrar prospectos",
      partner: true,
      ignitia: false,
    },
    {
      task: "Presentar IgnitiaOS",
      partner: true,
      ignitia: false,
    },
    {
      task: "Diagnóstico de IA",
      partner: false,
      ignitia: true,
    },
    {
      task: "Análisis del negocio",
      partner: false,
      ignitia: true,
    },
    {
      task: "Propuesta comercial",
      partner: false,
      ignitia: true,
    },
    {
      task: "Diseño Web",
      partner: false,
      ignitia: true,
    },
    {
      task: "SEO",
      partner: false,
      ignitia: true,
    },
    {
      task: "Automatizaciones",
      partner: false,
      ignitia: true,
    },
    {
      task: "Implementación de IA",
      partner: false,
      ignitia: true,
    },
    {
      task: "Configuración de CRM",
      partner: false,
      ignitia: true,
    },
    {
      task: "Capacitación del cliente",
      partner: false,
      ignitia: true,
    },
    {
      task: "Soporte técnico",
      partner: false,
      ignitia: true,
    },
    {
      task: "Mantenimiento continuo",
      partner: false,
      ignitia: true,
    },
    {
      task: "Cobrar comisiones",
      partner: true,
      ignitia: false,
    },
  ];

  return (
    <section className="bg-zinc-950 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            Sin conocimientos técnicos
          </span>

          <h2 className="mt-8 text-5xl font-bold">
            Tú Consigues el Cliente.
            <br />
            Nosotros Hacemos Todo el Trabajo.
          </h2>

          <p className="mt-6 text-lg text-zinc-400">
            Nuestro programa está diseñado para que puedas generar ingresos
            recomendando nuestros servicios, sin tener que desarrollar
            páginas web, configurar IA, hacer SEO o brindar soporte.
          </p>
        </div>

        <div className="mt-16 overflow-hidden rounded-3xl border border-zinc-800 bg-black shadow-2xl">
          <table className="w-full">
            <thead className="border-b border-zinc-800 bg-zinc-900">
              <tr>
                <th className="px-8 py-6 text-left text-lg font-semibold">
                  Actividad
                </th>

                <th className="w-44 px-6 py-6 text-center text-lg font-semibold">
                  Tú
                </th>

                <th className="w-44 px-6 py-6 text-center text-lg font-semibold text-blue-400">
                  IgnitiaOS
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.task}
                  className="border-b border-zinc-800 transition hover:bg-zinc-900/60"
                >
                  <td className="px-8 py-5 text-zinc-300">
                    {row.task}
                  </td>

                  <td className="text-center text-2xl">
                    {row.partner ? (
                      <span className="font-bold text-green-400">✓</span>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </td>

                  <td className="text-center text-2xl">
                    {row.ignitia ? (
                      <span className="font-bold text-green-400">✓</span>
                    ) : (
                      <span className="text-zinc-700">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-black p-8">
            <h3 className="text-xl font-semibold">
              Tu Objetivo
            </h3>

            <p className="mt-4 text-zinc-400">
              Aprovechar tu red de contactos para conectar empresas y
              profesionales con soluciones de IA que realmente generan
              resultados.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black p-8">
            <h3 className="text-xl font-semibold">
              Nuestro Objetivo
            </h3>

            <p className="mt-4 text-zinc-400">
              Entregar proyectos de alta calidad que hagan crecer al
              cliente y te permitan generar ingresos recurrentes gracias a
              una relación comercial de largo plazo.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500 bg-gradient-to-br from-blue-600/20 to-transparent p-8">
            <h3 className="text-xl font-semibold">
              El Resultado
            </h3>

            <p className="mt-4 text-zinc-300">
              Tú construyes un negocio basado en relaciones comerciales,
              mientras IgnitiaOS se convierte en tu equipo de desarrollo,
              marketing, IA y soporte técnico.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}