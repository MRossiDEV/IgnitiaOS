"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

const navigation = [
  { name: "Servicios", href: "#services" },
  { name: "Cómo Funciona", href: "#process" },
  { name: "Resultados", href: "#results" },
  { name: "FAQ", href: "#faq" },
];

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090B]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#09090B]/70">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <img
            src="/images/brand/logo.png"
            alt="IgnitiaAI"
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}

        <nav className="hidden items-center gap-8 lg:flex">

          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              {item.name}
            </a>
          ))}

        </nav>

        {/* Desktop CTA */}

        <div className="hidden items-center gap-4 lg:flex">

          <Link
            href="/reporte-demo"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Ver Demo
          </Link>

          <Link
            href="/report-wizard"
            className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition-all hover:bg-blue-500"
          >
            <Sparkles size={16} />

            Análisis Gratuito

            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

        </div>

        {/* Mobile Button */}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-xl border border-white/10 p-3 text-white lg:hidden"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {/* Mobile Menu */}

      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${
          isOpen ? "max-h-96 border-t border-white/10" : "max-h-0"
        }`}
      >
        <div className="space-y-2 bg-[#09090B] px-6 py-6">

          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-4 py-3 text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.name}
            </a>
          ))}

          <div className="pt-4">

            <Link
              href="/reporte-demo"
              className="mb-3 block rounded-xl border border-white/10 px-4 py-3 text-center text-zinc-300 transition hover:bg-white/5"
            >
              Ver Reporte Demo
            </Link>

            <Link
              href="/report-wizard"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 font-semibold transition hover:bg-blue-500"
            >
              <Sparkles size={18} />

              Análisis Inteligente Gratuito

              <ArrowRight size={18} />
            </Link>

          </div>

        </div>
      </div>
    </header>
  );
}