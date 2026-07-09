"use client";


import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";


export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    return (             
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
                href="/"
                className="tracking-tight"
              >
                <img src="images/brand/logo.png" alt="Ignitia Logo" className="h-14 w-auto" />
            </Link>

          </div>

          <div className="hidden lg:flex items-center gap-10 text-sm font-medium">
            <a href="#services" className="hover:text-cyan-400 transition">What We Do</a>
            <a href="#results" className="hover:text-cyan-400 transition">Results</a>
            <a href="#process" className="hover:text-cyan-400 transition">Process</a>
            <a href="#faq" className="hover:text-cyan-400 transition">FAQ</a>
          </div>

          <Link
                href="/report-wizard"
                className="group inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-4 text-base font-semibold transition-all hover:bg-blue-500"
            >
               Reporte Gratis

            </Link>
        </div>
      </nav >
    );
}