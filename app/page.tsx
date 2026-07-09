'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Menu,
  Bot,
  Brain,
  ShieldCheck,
  Workflow,
  BarChart3,
  Sparkles,
  Building2,
  ChevronRight,
  Play,
  Check,
  Cpu,
  Database,
  Globe,
  Zap,
  Users,
  Cloud,
  Lock,
  Target,
  LineChart,
  CheckCircle2,
  MonitorSmartphone
} from 'lucide-react'
import { motion } from 'framer-motion'
import NavBar from '@/components/landing/NavBar'
import Hero from '@/components/landing/Hero'


export default function HomePage() {
  const features = [
    {
      icon: Bot,
      title: 'AI Agents',
      desc: 'Specialized intelligent assistants for every department.'
    },
    {
      icon: Workflow,
      title: 'Automation',
      desc: 'Automate repetitive tasks and workflows.'
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      desc: 'Business intelligence powered by AI.'
    },
    {
      icon: Brain,
      title: 'Generative AI',
      desc: 'Text, images, voice, video and code.'
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security',
      desc: 'Private and secure infrastructure.'
    },
    {
      icon: Database,
      title: 'Knowledge Base',
      desc: 'Search and chat with company data.'
    }
  ]

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030712] text-white">

      {/* BACKGROUND */}

      <div className="fixed inset-0 -z-50">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#2563eb33,transparent_60%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:70px_70px]" />

        <div className="absolute left-1/2 top-80 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[180px]" />

      </div>

      {/* NAVBAR */}
      <NavBar />

      
      {/* HERO */}
      <Hero />

      
      {/* ========================================================= */}
      {/* EVERYTHING WE BUILD */}
      {/* ========================================================= */}

      <section className="py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <p className="uppercase tracking-[6px] text-blue-400">
              Qué Construimos
            </p>

            <h2 className="mt-4 text-5xl font-black">
              Un sistema completo para hacer crecer tu empresa.
            </h2>

            <p className="mt-6 max-w-3xl mx-auto text-zinc-400">
              No ofrecemos un único servicio. Diseñamos e implementamos
              toda la infraestructura necesaria para generar clientes,
              convertir oportunidades y escalar operaciones.
            </p>

          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

            {[
              {
                icon: Target,
                title: "Generación de Leads",
                items: [
                  "Facebook Ads",
                  "Google Ads",
                  "SEO",
                  "Funnels",
                  "Lead Magnets",
                ],
              },
              {
                icon: Globe,
                title: "Sitios Web",
                items: [
                  "Landing Pages",
                  "Sitios Corporativos",
                  "Portales",
                  "Micrositios",
                  "Optimización CRO",
                ],
              },
              {
                icon: Workflow,
                title: "CRM y Ventas",
                items: [
                  "Pipeline",
                  "Seguimiento",
                  "Lead Scoring",
                  "Automatización",
                  "Reportes",
                ],
              },
              {
                icon: Bot,
                title: "Automatización",
                items: [
                  "IA",
                  "WhatsApp",
                  "Emails",
                  "Chatbots",
                  "Workflows",
                ],
              },
              {
                icon: Brain,
                title: "Contenido",
                items: [
                  "Imágenes IA",
                  "Videos",
                  "Anuncios",
                  "Blogs",
                  "Social Media",
                ],
              },
              {
                icon: LineChart,
                title: "Analítica",
                items: [
                  "KPIs",
                  "Dashboards",
                  "ROI",
                  "Conversiones",
                  "Forecasting",
                ],
              },
            ].map((service) => (
              <div
                key={service.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:border-blue-500/40 hover:bg-blue-500/5"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/15">
                  <service.icon className="text-blue-400" size={30} />
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {service.title}
                </h3>

                <div className="mt-6 space-y-3">

                  {service.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3"
                    >
                      <CheckCircle2
                        size={18}
                        className="text-blue-400"
                      />

                      <span className="text-zinc-300">
                        {item}
                      </span>
                    </div>
                  ))}

                </div>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* IGNITIA OS */}
      {/* ========================================================= */}

      <section className="border-y border-white/5 bg-gradient-to-b from-blue-950/10 to-transparent py-32">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid items-center gap-20 lg:grid-cols-2">

            <div>

              <p className="uppercase tracking-[6px] text-blue-400">
                Nuestra Ventaja
              </p>

              <h2 className="mt-5 text-5xl font-black">
                Todo lo que hacemos está impulsado por Ignitia OS.
              </h2>

              <p className="mt-8 text-lg leading-9 text-zinc-400">

                Ignitia OS no es un software que vendemos.

                Es nuestro sistema operativo interno.

                Centraliza IA, automatización, CRM, campañas,
                desarrollo web, contenido y operaciones para que
                nuestro equipo entregue resultados mucho más rápido.

              </p>

              <div className="mt-12 grid grid-cols-2 gap-5">

                {[
                  "Agentes IA",
                  "CRM",
                  "Landing Builder",
                  "Campañas",
                  "Analytics",
                  "Automatizaciones",
                  "Knowledge Base",
                  "AI Studio",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5"
                  >
                    <div className="flex items-center gap-3">

                      <Brain
                        size={18}
                        className="text-blue-400"
                      />

                      <span className="font-medium">
                        {item}
                      </span>

                    </div>
                  </div>
                ))}

              </div>

            </div>

            <div className="relative">

              <div className="absolute inset-0 rounded-[40px] bg-blue-600/20 blur-[120px]" />

              <img
                src="/images/dashboard/dashboard-preview.png"
                alt=""
                className="relative rounded-[32px] border border-blue-500/20 shadow-2xl"
              />

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* GROWTH TEAM */}
      {/* ========================================================= */}

      <section className="py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <p className="uppercase tracking-[6px] text-blue-400">
              Tu Equipo
            </p>

            <h2 className="mt-4 text-5xl font-black">
              Obtienes un departamento completo,
              no un freelancer.
            </h2>

            <p className="mt-6 max-w-3xl mx-auto text-zinc-400">
              En lugar de contratar múltiples proveedores,
              trabajas con un único equipo respaldado por IA.
            </p>

          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

            {[
              "Estratega de Marketing",
              "Especialista en Leads",
              "Desarrollador Web",
              "Ingeniero de IA",
              "Analista de Datos",
              "Creador de Contenido",
              "Especialista en Automatización",
              "Gestor de Campañas",
            ].map((member) => (
              <div
                key={member}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center"
              >

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600/15">

                  <Building2
                    size={34}
                    className="text-blue-400"
                  />

                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {member}
                </h3>

                <p className="mt-3 text-sm text-zinc-500">
                  Respaldado por IA y automatización.
                </p>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* INDUSTRIES */}
      {/* ========================================================= */}

      <section className="border-y border-white/5 py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <p className="uppercase tracking-[6px] text-blue-400">
              Industrias
            </p>

            <h2 className="mt-4 text-5xl font-black">
              Diseñado para empresas que necesitan crecer.
            </h2>

            <p className="mt-6 max-w-3xl mx-auto text-zinc-400">
              Adaptamos nuestra estrategia y nuestros sistemas a la realidad
              de cada industria.
            </p>

          </div>

          <div className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-5">

            {[
              "Inmobiliarias",
              "Migración",
              "Construcción",
              "Abogados",
              "Salud",
              "Finanzas",
              "Educación",
              "Servicios",
              "Industria",
              "Tecnología",
            ].map((industry) => (

              <div
                key={industry}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center transition hover:border-blue-500/40 hover:bg-blue-500/5"
              >

                <Building2
                  className="mx-auto text-blue-400"
                  size={34}
                />

                <h3 className="mt-5 text-xl font-bold">

                  {industry}

                </h3>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* CASE STUDIES */}
      {/* ========================================================= */}

      <section className="py-28">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <p className="uppercase tracking-[6px] text-blue-400">

              Resultados

            </p>

            <h2 className="mt-4 text-5xl font-black">

              Lo que buscamos entregar.

            </h2>

          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-3">

            {[
              {
                title: "Empresa de Migración",
                leads: "267",
                conversion: "31%",
                roi: "6.8x",
              },
              {
                title: "Constructora",
                leads: "513",
                conversion: "22%",
                roi: "8.1x",
              },
              {
                title: "Inmobiliaria",
                leads: "821",
                conversion: "18%",
                roi: "9.4x",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-10"
              >

                <h3 className="text-2xl font-bold">

                  {item.title}

                </h3>

                <div className="mt-10 space-y-6">

                  <div className="flex justify-between">

                    <span className="text-zinc-400">
                      Leads
                    </span>

                    <span className="font-bold text-blue-400">

                      {item.leads}

                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-zinc-400">
                      Conversión
                    </span>

                    <span className="font-bold text-green-400">

                      {item.conversion}

                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-zinc-400">
                      ROI
                    </span>

                    <span className="font-bold text-cyan-400">

                      {item.roi}

                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* WHY IGNITIA */}
      {/* ========================================================= */}

      <section className="border-y border-white/5 bg-blue-950/5 py-32">

        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center">

            <p className="uppercase tracking-[6px] text-blue-400">

              Diferencia

            </p>

            <h2 className="mt-4 text-5xl font-black">

              Agencia tradicional vs Ignitia

            </h2>

          </div>

          <div className="mt-20 overflow-hidden rounded-3xl border border-white/10">

            <table className="w-full">

              <thead className="bg-blue-600/10">

                <tr>

                  <th className="p-6 text-left">
                    Característica
                  </th>

                  <th className="p-6">
                    Agencia
                  </th>

                  <th className="p-6">
                    Ignitia
                  </th>

                </tr>

              </thead>

              <tbody>

                {[
                  ["Generación de Leads", "✔", "✔"],
                  ["Sitios Web", "Algunos", "✔"],
                  ["CRM", "✖", "✔"],
                  ["Automatización", "✖", "✔"],
                  ["IA", "✖", "✔"],
                  ["Reportes", "Básicos", "✔"],
                  ["Optimización Continua", "Limitada", "✔"],
                  ["Equipo Multidisciplinario", "Parcial", "✔"],
                ].map((row) => (

                  <tr
                    key={row[0]}
                    className="border-t border-white/10"
                  >

                    <td className="p-6">

                      {row[0]}

                    </td>

                    <td className="text-center">

                      {row[1]}

                    </td>

                    <td className="text-center font-semibold text-blue-400">

                      {row[2]}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* ===========================
        CONTACTO + FOOTER
      =========================== */}

      <section
        id="contacto"
        className="relative overflow-hidden py-28"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6">

          <div className="rounded-[40px] border border-blue-500/20 bg-gradient-to-br from-[#071321] via-[#0b1628] to-[#050b14] p-12">

            <div className="grid gap-16 lg:grid-cols-2">

              <div>

                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-blue-300">
                  Comencemos
                </span>

                <h2 className="mt-6 text-5xl font-black leading-tight">
                  Convirtamos tu empresa en
                  <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    una máquina de crecimiento
                  </span>
                </h2>

                <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-400">
                  Analizamos tu negocio, identificamos los cuellos de botella,
                  diseñamos una estrategia personalizada y construimos todo el
                  sistema necesario para atraer más clientes y vender más.
                </p>

                <div className="mt-12 space-y-5">

                  {[
                    "Auditoría gratuita del proceso comercial",
                    "Diagnóstico completo del marketing",
                    "Plan de crecimiento personalizado",
                    "Sin compromiso inicial",
                  ].map((item) => (

                    <div
                      key={item}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                        ✓
                      </div>

                      <span className="text-lg">
                        {item}
                      </span>
                    </div>

                  ))}

                </div>

              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur-xl">

                <h3 className="text-3xl font-bold">
                  Solicitar Auditoría
                </h3>

                <p className="mt-3 text-zinc-400">
                  Cuéntanos sobre tu empresa y nos pondremos en contacto contigo.
                </p>

                <div className="mt-8 space-y-5">

                  <input
                    placeholder="Nombre"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 outline-none transition focus:border-blue-500"
                  />

                  <input
                    placeholder="Empresa"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 outline-none transition focus:border-blue-500"
                  />

                  <input
                    placeholder="Correo electrónico"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 outline-none transition focus:border-blue-500"
                  />

                  <input
                    placeholder="Teléfono (opcional)"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 outline-none transition focus:border-blue-500"
                  />

                  <textarea
                    rows={5}
                    placeholder="Describe brevemente tu empresa y tus objetivos..."
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-6 py-4 outline-none transition focus:border-blue-500"
                  />

                  <button className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-5 text-lg font-bold transition hover:opacity-90">
                    Solicitar Auditoría Gratuita →
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <footer className="border-t border-white/10 py-14">

        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-4">

          <div>

            <img
              src="/images/brand/logo.png"
              alt="Ignitia"
              className="h-16 w-auto"
            />

            <p className="mt-5 text-sm leading-7 text-zinc-500">
              Ignitia construye sistemas completos de crecimiento para empresas.
              No vendemos software.
              Creamos, operamos y optimizamos el motor comercial que impulsa tu negocio.
            </p>

          </div>

          <div>

            <h4 className="mb-5 font-bold">
              Servicios
            </h4>

            <ul className="space-y-3 text-zinc-500">

              <li>Generación de Prospectos</li>
              <li>Automatización</li>
              <li>Desarrollo Web</li>
              <li>Embudos de Venta</li>
              <li>Contenido IA</li>

            </ul>

          </div>

          <div>

            <h4 className="mb-5 font-bold">
              Empresa
            </h4>

            <ul className="space-y-3 text-zinc-500">

              <li>Nosotros</li>
              <li>Casos de Éxito</li>
              <li>Proceso</li>
              <li>Contacto</li>

            </ul>

          </div>

          <div>

            <h4 className="mb-5 font-bold">
              Contacto
            </h4>

            <div className="space-y-3 text-zinc-500">

              <p>Montevideo, Uruguay</p>
              <p>contacto@ignitia.ai</p>
              <p>www.ignitia.ai</p>

            </div>

          </div>

        </div>

        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 pt-8 text-sm text-zinc-600 lg:flex-row">

          <p>
            © {new Date().getFullYear()} Ignitia AI.
            Todos los derechos reservados.
          </p>

          <div className="flex gap-8">

            <a href="#">
              Privacidad
            </a>

            <a href="#">
              Términos
            </a>

            <a href="#">
              Cookies
            </a>

          </div>

        </div>

      </footer>


     

    </main>

  )

}