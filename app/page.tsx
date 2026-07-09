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
import TrustSection from '@/components/landing/TrustSection'
import HowItWorksSection from '@/components/landing/HowItWorks'
import Services from '@/components/landing/Services'
import WhyIgnitia from '@/components/landing/WhyIgnitia'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'
import MiniCTA from '@/components/landing/MiniCTA'

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

      {/* TRUST SECTION */}
      <TrustSection />

      {/* HOW IT WORKS */}
      <HowItWorksSection />

      {/* MINI CTA */}
      <MiniCTA />

      {/* SERVICES */}
      <Services />

      {/* WHY IGNITIA */}
      <WhyIgnitia />
      
      {/* CTA */}
      <CTA />


      
      {/* FOOTER */}
      <Footer />




     

    </main>

  )

}