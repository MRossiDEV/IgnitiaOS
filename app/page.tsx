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

      {/* <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link
            href="/"
            className="text-4xl font-black tracking-tight text-white"
          >
            <span className="text-white">Ignitia</span>

            <span className="text-blue-500">AI</span>
          </Link>

          <nav className="hidden gap-10 text-sm text-gray-300 lg:flex">

            <Link href="#">Platform</Link>

            <Link href="#">Solutions</Link>

            <Link href="#">AI Agents</Link>

            <Link href="#">Pricing</Link>

            <Link href="#">Developers</Link>

            <Link href="#">Resources</Link>

          </nav>

          <div className="hidden items-center gap-4 lg:flex">

            <button className="rounded-full border border-white/20 px-5 py-2 hover:bg-white/10">

              Login

            </button>

            <button className="rounded-full bg-blue-600 px-6 py-2 font-semibold transition hover:bg-blue-500">

              Start Free

            </button>

          </div>

          <button className="lg:hidden">

            <Menu />

          </button>

        </div>

      </header> */}

      
      {/* HERO */}
      <Hero />

      {/* <section className="relative overflow-hidden min-h-screen flex items-center">

        
      
        <div className="absolute inset-0">
          <img
            src="/images/landing/hero-bkg.png"
            alt=""
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-[#030712]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/85 to-[#030712]/60" />

          <div className="absolute left-1/2 top-0 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />
          <div className="absolute right-0 top-20 h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[160px]" />
          <div className="absolute left-0 bottom-0 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[150px]" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-36">

          <div className="grid items-center gap-20 lg:grid-cols-2">

            

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .8 }}
            >

              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-cyan-300 backdrop-blur-xl">

                <Sparkles size={16} />

                AI Growth Platform

              </div>

              <h1 className="mt-8 text-6xl font-black leading-[1.05] tracking-tight lg:text-8xl">

                Your External

                <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-400 bg-clip-text text-transparent">

                  Growth Team

                </span>

              </h1>

              <p className="mt-8 max-w-2xl text-xl leading-9 text-zinc-300">

                Ignitia AI builds and operates your complete customer acquisition
                engine using AI Agents, automation, landing pages, CRM,
                advertising, qualification systems and analytics.

                You focus on your business.
                We generate qualified customers.

              </p>

              <div className="mt-12 flex flex-wrap gap-5">

                <button className="group flex items-center gap-3 rounded-2xl bg-cyan-500 px-8 py-5 font-bold text-black transition hover:bg-cyan-400">

                  Get Free Growth Audit

                  <ArrowRight className="transition group-hover:translate-x-1" />

                </button>

                <button className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-8 py-5 backdrop-blur-xl transition hover:bg-white/10">

                  <Play size={18} />

                  Watch Demo

                </button>

              </div>

              <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4">

                <div>
                  <h2 className="text-4xl font-black text-cyan-400">150+</h2>
                  <p className="mt-2 text-zinc-400">AI Tools</p>
                </div>

                <div>
                  <h2 className="text-4xl font-black text-cyan-400">40+</h2>
                  <p className="mt-2 text-zinc-400">AI Agents</p>
                </div>

                <div>
                  <h2 className="text-4xl font-black text-cyan-400">500K+</h2>
                  <p className="mt-2 text-zinc-400">Leads Generated</p>
                </div>

                <div>
                  <h2 className="text-4xl font-black text-cyan-400">24/7</h2>
                  <p className="mt-2 text-zinc-400">Automation</p>
                </div>

              </div>

            </motion.div>

            

            <motion.div
              initial={{ opacity: 0, scale: .92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >

              <div className="rounded-[36px] border border-cyan-500/20 bg-white/5 p-6 backdrop-blur-3xl shadow-[0_0_120px_rgba(6,182,212,.18)]">

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-2xl font-bold">

                      Ignitia Command Center

                    </h3>

                    <p className="text-zinc-400">

                      AI Business Operating System

                    </p>

                  </div>

                  <div className="rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-black">

                    LIVE

                  </div>

                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">

                  {[
                    ["Campaigns", "26", "+4"],
                    ["Qualified Leads", "2,450", "+18%"],
                    ["Revenue", "$98K", "+31%"]
                  ].map(([title, value, growth]) => (

                    <div
                      key={title}
                      className="rounded-2xl border border-white/10 bg-black/30 p-5"
                    >

                      <p className="text-zinc-400">{title}</p>

                      <h2 className="mt-3 text-4xl font-black">

                        {value}

                      </h2>

                      <p className="mt-2 text-green-400">

                        {growth}

                      </p>

                    </div>

                  ))}

                </div>

                <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-6">

                  <div className="mb-6 flex items-center justify-between">

                    <h3 className="text-xl font-bold">

                      AI Agents Activity

                    </h3>

                    <button className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5">

                      Open Dashboard

                    </button>

                  </div>

                  <div className="space-y-6">

                    {[
                      ["Lead Hunter", "Generating qualified prospects", 96],
                      ["Marketing Agent", "Launching Meta Campaign", 88],
                      ["Sales Assistant", "Qualifying new leads", 81],
                      ["Content Creator", "Writing landing page", 74],
                      ["CRM Manager", "Updating pipeline", 91],
                    ].map(([title, desc, progress]) => (

                      <div key={title as string}>

                        <div className="mb-2 flex justify-between">

                          <span className="font-medium">

                            {title}

                          </span>

                          <span className="text-cyan-400">

                            {progress}%

                          </span>

                        </div>

                        <div className="h-2 rounded-full bg-white/10">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            style={{ width: `${progress}%` }}
                          />

                        </div>

                        <p className="mt-2 text-sm text-zinc-400">

                          {desc}

                        </p>

                      </div>

                    ))}

                  </div>

                </div>

              </div>

              

              <motion.div
                animate={{ y: [-12, 12, -12] }}
                transition={{ repeat: Infinity, duration: 5 }}
                className="absolute -left-16 top-14 rounded-3xl border border-cyan-500/20 bg-[#071018]/90 p-6 backdrop-blur-2xl"
              >

                <Bot className="mb-4 text-cyan-400" size={34} />

                <h4 className="font-bold">

                  AI Agents

                </h4>

                <p className="mt-2 text-sm text-zinc-400">

                  Autonomous Teams

                </p>

              </motion.div>

              <motion.div
                animate={{ y: [15, -15, 15] }}
                transition={{ repeat: Infinity, duration: 6 }}
                className="absolute -right-14 bottom-12 rounded-3xl border border-cyan-500/20 bg-[#071018]/90 p-6 backdrop-blur-2xl"
              >

                <Brain className="mb-4 text-cyan-400" size={34} />

                <h4 className="font-bold">

                  AI Studio

                </h4>

                <p className="mt-2 text-sm text-zinc-400">

                  Generate Apps, Funnels & Content

                </p>

              </motion.div>

            </motion.div>

          </div>

        </div>

      </section> */}

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


      {/*=============================*/}

      {/* LOGOS */}
      {/* <section className="border-y border-white/10 bg-black/20 py-20">

        <div className="mx-auto max-w-7xl px-6">

          <p className="mb-14 text-center uppercase tracking-[0.3em] text-gray-500">

            Trusted by innovative businesses

          </p>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">

            {[
              'Microsoft',
              'Google',
              'Amazon',
              'Oracle',
              'OpenAI',
              'NVIDIA'
            ].map((company) => (

              <div
                key={company}
                className="rounded-2xl border border-white/5 bg-white/5 py-8 text-center text-lg font-semibold text-gray-400 transition hover:border-blue-500/30 hover:text-white"
              >

                {company}

              </div>

            ))}

          </div>

        </div>

      </section> */}

      {/* FEATURES */}
      {/* <section className="py-36">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto mb-20 max-w-3xl text-center">

            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-sm text-blue-300">

              Platform

            </span>

            <h2 className="mt-8 text-5xl font-black">

              Everything Your Business Needs

            </h2>

            <p className="mt-8 text-xl leading-9 text-gray-400">

              A complete AI operating system for marketing, sales,
              customer service, analytics, automation, knowledge,
              content generation and business growth.

            </p>

          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {features.map((feature) => {

              const Icon = feature.icon

              return (

                <motion.div

                  whileHover={{
                    y: -8
                  }}

                  key={feature.title}

                  className="group rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:border-blue-500/40"

                >

                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">

                    <Icon size={32} />

                  </div>

                  <h3 className="text-2xl font-bold">

                    {feature.title}

                  </h3>

                  <p className="mt-4 leading-8 text-gray-400">

                    {feature.desc}

                  </p>

                  <button className="mt-8 flex items-center gap-2 text-blue-400">

                    Learn More

                    <ChevronRight size={18} />

                  </button>

                </motion.div>

              )

            })}

          </div>

        </div>

      </section> */}

      {/* PLATFORM */}
      {/* <section className="py-36">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid items-center gap-20 lg:grid-cols-2">

            <div>

              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-sm text-blue-300">

                Enterprise Platform

              </span>

              <h2 className="mt-8 text-5xl font-black leading-tight">

                One Platform.

                <br />

                Unlimited AI.

              </h2>

              <p className="mt-8 text-lg leading-9 text-gray-400">

                Ignitia AI combines every modern business tool into a

                unified AI operating system.

                Replace dozens of subscriptions while increasing

                productivity across every department.

              </p>

              <div className="mt-12 space-y-6">

                {[
                  "CRM & Lead Management",
                  "AI Sales Assistant",
                  "Marketing Automation",
                  "Landing Page Builder",
                  "AI Image & Video Studio",
                  "Knowledge Base",
                  "Customer Support",
                  "Document Intelligence"
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-4"
                  >

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">

                      <Check size={18} />

                    </div>

                    <span className="text-lg">

                      {item}

                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="relative">

              <div className="absolute inset-0 rounded-[40px] bg-blue-600/20 blur-[120px]" />

              <div className="relative rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl">

                <div className="grid gap-6 md:grid-cols-2">

                  {[
                    {
                      icon: Cpu,
                      title: "AI Agents",
                      value: "42"
                    },
                    {
                      icon: Cloud,
                      title: "Cloud Apps",
                      value: "85"
                    },
                    {
                      icon: Globe,
                      title: "Websites",
                      value: "132"
                    },
                    {
                      icon: Lock,
                      title: "Security",
                      value: "100%"
                    },
                    {
                      icon: MonitorSmartphone,
                      title: "Devices",
                      value: "26"
                    },
                    {
                      icon: Zap,
                      title: "Automations",
                      value: "4,280"
                    }
                  ].map((card) => {

                    const Icon = card.icon

                    return (

                      <div
                        key={card.title}
                        className="rounded-3xl border border-white/10 bg-black/30 p-8 transition hover:border-blue-500/30"
                      >

                        <Icon
                          className="mb-5 text-blue-400"
                          size={34}
                        />

                        <h3 className="text-3xl font-bold">

                          {card.value}

                        </h3>

                        <p className="mt-2 text-gray-400">

                          {card.title}

                        </p>

                      </div>

                    )

                  })}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section> */}

      {/* INDUSTRIES */}

      {/* <section className="bg-black/20 py-36">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-20 text-center">

            <h2 className="text-5xl font-black">

              Built for Every Industry

            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-400">

              Ignitia adapts to any business model with specialized AI
              assistants and intelligent workflows.

            </p>

          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: Building2,
                title: "Construction"
              },
              {
                icon: Users,
                title: "Education"
              },
              {
                icon: Brain,
                title: "Healthcare"
              },
              {
                icon: Globe,
                title: "Government"
              },
              {
                icon: BarChart3,
                title: "Finance"
              },
              {
                icon: Workflow,
                title: "Manufacturing"
              },
              {
                icon: ShieldCheck,
                title: "Cybersecurity"
              },
              {
                icon: Bot,
                title: "Agencies"
              }
            ].map((industry) => {

              const Icon = industry.icon

              return (

                <div
                  key={industry.title}
                  className="rounded-[30px] border border-white/10 bg-white/5 p-10 transition hover:-translate-y-2 hover:border-blue-500/30"
                >

                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">

                    <Icon size={30} />

                  </div>

                  <h3 className="text-2xl font-bold">

                    {industry.title}

                  </h3>

                  <p className="mt-4 leading-8 text-gray-400">

                    AI-powered tools designed specifically for modern
                    organizations.

                  </p>

                </div>

              )

            })}

          </div>

        </div>

      </section> */}

      {/* WORKFLOW AUTOMATION */}
      {/* <section className="py-36">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-20 text-center">

            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-blue-300">

              Workflow Automation

            </span>

            <h2 className="mt-8 text-5xl font-black">

              Connect Everything

            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-400">

              Build intelligent workflows that connect your apps,
              automate repetitive tasks and let AI make decisions in
              real time.

            </p>

          </div>

          <div className="grid gap-10 lg:grid-cols-2">

            <div className="rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

              <h3 className="mb-10 text-3xl font-bold">

                Visual Workflow Builder

              </h3>

              <div className="space-y-8">

                <div className="rounded-2xl border border-blue-500/20 bg-blue-600/10 p-6">

                  <p className="text-blue-300">

                    Trigger

                  </p>

                  <h4 className="mt-2 text-xl font-semibold">

                    New Lead Submitted

                  </h4>

                </div>

                <div className="flex justify-center">

                  <ArrowRight
                    className="rotate-90 text-blue-400"
                    size={30}
                  />

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-6">

                  <p className="text-gray-400">

                    AI Decision

                  </p>

                  <h4 className="mt-2 text-xl font-semibold">

                    Qualify Lead

                  </h4>

                </div>

                <div className="flex justify-center">

                  <ArrowRight
                    className="rotate-90 text-blue-400"
                    size={30}
                  />

                </div>

                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">

                  <p className="text-green-300">

                    Action

                  </p>

                  <h4 className="mt-2 text-xl font-semibold">

                    Assign Sales Agent

                  </h4>

                </div>

              </div>

            </div>

            <div className="grid gap-8">

              {[
                "AI Email Sequences",
                "CRM Automation",
                "Lead Distribution",
                "WhatsApp Messaging",
                "Proposal Generation",
                "Appointment Scheduling",
                "Customer Follow-up",
                "Invoice Creation"
              ].map((tool) => (

                <div
                  key={tool}
                  className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:border-blue-500/30"
                >

                  <div className="flex items-center gap-5">

                    <div className="rounded-2xl bg-blue-600 p-4">

                      <Workflow size={24} />

                    </div>

                    <div>

                      <h3 className="text-xl font-semibold">

                        {tool}

                      </h3>

                      <p className="text-gray-400">

                        Powered by AI

                      </p>

                    </div>

                  </div>

                  <ChevronRight />

                </div>

              ))}

            </div>

          </div>

        </div>

      </section> */}

      {/* ANALYTICS */}
      {/* <section className="bg-black/20 py-36">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid items-center gap-20 lg:grid-cols-2">

            <div>

              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-blue-300">

                AI Analytics

              </span>

              <h2 className="mt-8 text-5xl font-black">

                Data that drives

                <br />

                better decisions.

              </h2>

              <p className="mt-8 text-xl leading-9 text-gray-400">

                Turn millions of records into interactive dashboards,
                forecasts and AI-generated business insights.

              </p>

              <div className="mt-12 grid grid-cols-2 gap-8">

                <div>

                  <h3 className="text-5xl font-black text-blue-400">

                    +430%

                  </h3>

                  <p className="mt-2 text-gray-400">

                    Productivity Increase

                  </p>

                </div>

                <div>

                  <h3 className="text-5xl font-black text-blue-400">

                    99.8%

                  </h3>

                  <p className="mt-2 text-gray-400">

                    AI Accuracy

                  </p>

                </div>

                <div>

                  <h3 className="text-5xl font-black text-blue-400">

                    80%

                  </h3>

                  <p className="mt-2 text-gray-400">

                    Time Saved

                  </p>

                </div>

                <div>

                  <h3 className="text-5xl font-black text-blue-400">

                    24/7

                  </h3>

                  <p className="mt-2 text-gray-400">

                    Live Monitoring

                  </p>

                </div>

              </div>

            </div>

            <div className="rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

              <div className="space-y-8">

                {[
                  ["Marketing ROI", "92%"],
                  ["Sales Conversion", "81%"],
                  ["Automation Score", "97%"],
                  ["Customer Satisfaction", "96%"],
                  ["Agent Performance", "94%"]
                ].map(([name, value]) => (

                  <div key={name}>

                    <div className="mb-3 flex justify-between">

                      <span>{name}</span>

                      <span className="text-blue-400">

                        {value}

                      </span>

                    </div>

                    <div className="h-3 rounded-full bg-white/10">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                        style={{
                          width: value
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </section> */}

      {/* TESTIMONIALS */}
      {/* <section className="py-36">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-20 text-center">

            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-blue-300">

              Trusted Worldwide

            </span>

            <h2 className="mt-8 text-5xl font-black">

              Businesses Love Ignitia

            </h2>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-400">

              Thousands of organizations use Ignitia AI to automate
              operations, increase sales and empower their teams.

            </p>

          </div>

          <div className="grid gap-8 lg:grid-cols-3">

            {[
              {
                name:"Sarah Johnson",
                role:"CEO",
                company:"NextVision",
                text:"Ignitia completely transformed the way our company operates. We automated over 80% of repetitive work."
              },
              {
                name:"Michael Chen",
                role:"Operations Director",
                company:"CloudScale",
                text:"The AI agents work like an entire digital workforce. Productivity increased dramatically."
              },
              {
                name:"Emma Rodriguez",
                role:"Founder",
                company:"BuildTech",
                text:"One platform replaced more than ten software subscriptions while improving every workflow."
              }
            ].map((item)=>(
              <div
                key={item.name}
                className="rounded-[32px] border border-white/10 bg-white/5 p-10 backdrop-blur-xl"
              >

                <div className="mb-8 flex gap-1 text-blue-400">

                  ★★★★★

                </div>

                <p className="leading-9 text-gray-300">

                  "{item.text}"

                </p>

                <div className="mt-10 flex items-center gap-4">

                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400"/>

                  <div>

                    <h4 className="font-bold">

                      {item.name}

                    </h4>

                    <p className="text-gray-400">

                      {item.role} • {item.company}

                    </p>

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </section> */}

      {/* PRICING */}
      {/* <section className="bg-black/20 py-36">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mb-20 text-center">

            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-blue-300">

              Pricing

            </span>

            <h2 className="mt-8 text-5xl font-black">

              Simple Enterprise Pricing

            </h2>

          </div>

          <div className="grid gap-10 lg:grid-cols-3">

            {[
              {
                title:"Starter",
                price:"29",
                featured:false,
                items:[
                  "5 AI Agents",
                  "CRM",
                  "Landing Pages",
                  "Automation",
                  "Analytics"
                ]
              },
              {
                title:"Professional",
                price:"99",
                featured:true,
                items:[
                  "Unlimited AI Agents",
                  "Marketing Suite",
                  "AI Studio",
                  "Sales Platform",
                  "Priority Support"
                ]
              },
              {
                title:"Enterprise",
                price:"Custom",
                featured:false,
                items:[
                  "Dedicated Infrastructure",
                  "Private AI",
                  "Custom Integrations",
                  "Unlimited Users",
                  "Enterprise SLA"
                ]
              }
            ].map((plan)=>(

              <div
                key={plan.title}
                className={`rounded-[36px] border p-10 backdrop-blur-xl ${
                  plan.featured
                    ? "border-blue-500 bg-blue-600/10"
                    : "border-white/10 bg-white/5"
                }`}
              >

                <h3 className="text-3xl font-bold">

                  {plan.title}

                </h3>

                <div className="mt-8">

                  <span className="text-6xl font-black">

                    {plan.price === "Custom" ? plan.price : `$${plan.price}`}

                  </span>

                  {plan.price !== "Custom" && (
                    <span className="ml-2 text-gray-400">

                      /month

                    </span>
                  )}

                </div>

                <div className="mt-10 space-y-5">

                  {plan.items.map((feature)=>(

                    <div
                      key={feature}
                      className="flex items-center gap-4"
                    >

                      <Check
                        className="text-blue-400"
                        size={18}
                      />

                      {feature}

                    </div>

                  ))}

                </div>

                <button className={`mt-12 w-full rounded-2xl py-4 font-semibold transition ${
                  plan.featured
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "border border-white/10 hover:bg-white/5"
                }`}>

                  Get Started

                </button>

              </div>

            ))}

          </div>

        </div>

      </section> */}

      {/* FAQ */}
      {/* <section className="py-36">

        <div className="mx-auto max-w-5xl px-6">

          <div className="mb-20 text-center">

            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-blue-300">

              Frequently Asked Questions

            </span>

            <h2 className="mt-8 text-5xl font-black">

              Everything you need to know

            </h2>

          </div>

          <div className="space-y-6">

            {[
              {
                q:"What is Ignitia AI?",
                a:"Ignitia AI is an enterprise AI operating system combining AI agents, CRM, automations, analytics, websites, content generation and business tools in one platform."
              },
              {
                q:"Can I create custom AI agents?",
                a:"Yes. Create specialized AI assistants trained for sales, marketing, customer support, HR, finance and any custom workflow."
              },
              {
                q:"Does Ignitia integrate with other software?",
                a:"Yes. Connect CRMs, ERPs, email providers, APIs and thousands of external applications."
              },
              {
                q:"Is my data secure?",
                a:"Enterprise-grade encryption, role permissions, private AI deployment and complete ownership of your data."
              }
            ].map((faq)=>(

              <details
                key={faq.q}
                className="group rounded-3xl border border-white/10 bg-white/5 p-8"
              >

                <summary className="cursor-pointer list-none text-xl font-semibold">

                  {faq.q}

                </summary>

                <p className="mt-6 leading-8 text-gray-400">

                  {faq.a}

                </p>

              </details>

            ))}

          </div>

        </div>

      </section> */}

      {/* CTA */}
      {/* <section className="relative overflow-hidden py-40">

        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/20 via-blue-500/10 to-cyan-500/20" />

        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[180px]" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">

          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-5 py-2 text-blue-300">

            Ready to Scale?

          </span>

          <h2 className="mt-10 text-6xl font-black leading-tight">

            Build the Future

            <br />

            with AI

          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-gray-400">

            Launch intelligent workflows, AI employees, business
            automation and enterprise tools from a single platform.

          </p>

          <div className="mt-14 flex flex-wrap justify-center gap-6">

            <button className="rounded-2xl bg-blue-600 px-10 py-5 text-lg font-semibold transition hover:bg-blue-500">

              Start Free

            </button>

            <button className="rounded-2xl border border-white/10 px-10 py-5 text-lg transition hover:bg-white/5">

              Book Demo

            </button>

          </div>

        </div>

      </section> */}

      {/* FOOTER */}
      {/* <footer className="border-t border-white/10 bg-black/40">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="grid gap-16 lg:grid-cols-5">

            <div className="lg:col-span-2">

              <h2 className="text-4xl font-black">

                Ignitia

                <span className="text-blue-500">

                  AI

                </span>

              </h2>

              <p className="mt-8 max-w-md leading-8 text-gray-400">

                Enterprise AI platform that combines intelligent agents,
                CRM, websites, automation, analytics, AI Studio,
                cybersecurity and business intelligence into one
                operating system.

              </p>

            </div>

            {[
              {
                title:"Platform",
                links:[
                  "AI Agents",
                  "Automation",
                  "CRM",
                  "Analytics",
                  "AI Studio"
                ]
              },
              {
                title:"Company",
                links:[
                  "About",
                  "Careers",
                  "Partners",
                  "Blog",
                  "Contact"
                ]
              },
              {
                title:"Resources",
                links:[
                  "Documentation",
                  "API",
                  "Support",
                  "Community",
                  "Status"
                ]
              }
            ].map((column)=>(

              <div key={column.title}>

                <h3 className="mb-8 text-lg font-semibold">

                  {column.title}

                </h3>

                <div className="space-y-4">

                  {column.links.map((link)=>(

                    <a
                      key={link}
                      href="#"
                      className="block text-gray-400 transition hover:text-blue-400"
                    >

                      {link}

                    </a>

                  ))}

                </div>

              </div>

            ))}

          </div>

          <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-10 md:flex-row">

            <p className="text-gray-500">

              © 2026 Ignitia AI. All rights reserved.

            </p>

            <div className="flex gap-8 text-gray-500">

              <a href="#">Privacy</a>

              <a href="#">Terms</a>

              <a href="#">Security</a>

            </div>

          </div>

        </div>

      </footer> */}

    </main>

  )

}