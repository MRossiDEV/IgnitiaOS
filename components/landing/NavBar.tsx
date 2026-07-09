"use client";


import { useState } from "react";
import Link from "next/link";


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

          <button 
            onClick={() => document.getElementById('audit')?.scrollIntoView({ behavior: 'smooth' })}
            className="rounded-xl bg-blue-500 text-black px-2 py-3 font-semibold hover:bg-blue-200 transition"
          >
            Auditotia GRATIS
          </button>
        </div>
      </nav >
    );
}