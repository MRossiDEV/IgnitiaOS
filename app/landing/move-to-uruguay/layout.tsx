'use client';

import { useEffect, useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Globe,
  MapPin,
} from 'lucide-react';

export default function HeroSection() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#070B14]">

      {/* Background Image */}

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1920')",
        }}
      />

      {/* Overlay */}

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#070B14]" />

      {/* Glow */}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/20 blur-[150px]" />

      {/* NAVBAR */}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-xl bg-black/40 border-b border-white/10'
            : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Menu size={18} />
            </button>

            <div>
              <div className="text-xs text-sky-300 uppercase tracking-widest">
                Uruguay
              </div>

              <div className="font-semibold">
                Intelligence Portal
              </div>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Search size={18} />
            </button>

            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Bell size={18} />
            </button>

          </div>

        </div>
      </header>

      {/* HERO CONTENT */}

      <div className="relative z-10 px-6 pt-32 pb-24">

        <div className="max-w-7xl mx-auto">

          {/* Badge */}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10">

            <Globe className="w-4 h-4 text-yellow-400" />

            <span className="text-sm text-white/80">
              Country Intelligence Platform
            </span>

          </div>

          {/* Title */}

          <h1 className="mt-8 text-5xl md:text-7xl font-bold leading-tight max-w-4xl">

            Discover What
            <span className="block text-sky-400">
              Life In Uruguay
            </span>
            Actually Looks Like

          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">

            Explore economy, healthcare, safety, climate,
            technology, housing, education and residency
            opportunities through a single intelligence platform.

          </p>

          {/* CTA */}

          <div className="flex flex-col sm:flex-row gap-4 mt-10">

            <button className="h-14 px-8 rounded-2xl bg-yellow-400 text-black font-semibold text-lg">
              Explore Uruguay
            </button>

            <button className="h-14 px-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
              Compare Cities
            </button>

          </div>

          {/* Quick Stats */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">

            {[
              ['Population', '3.5M'],
              ['Internet', 'Excellent'],
              ['Safety', 'High'],
              ['Healthcare', 'Strong'],
            ].map(([label, value]) => (
              <div
                key={label}
                className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-5"
              >
                <div className="text-white/50 text-sm">
                  {label}
                </div>

                <div className="mt-2 text-xl font-semibold">
                  {value}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Floating Card */}

      <div className="absolute bottom-8 left-0 right-0 px-6">

        <div className="max-w-7xl mx-auto">

          <div className="bg-[#0E1628]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6">

            <div className="flex items-center justify-between">

              <div>

                <div className="text-white/50 text-sm">
                  Featured City
                </div>

                <div className="text-2xl font-bold mt-1">
                  Montevideo
                </div>

                <div className="text-white/60 mt-2">
                  Coastal capital • High quality of life • Strong infrastructure
                </div>

              </div>

              <button className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center">
                <ChevronDown />
              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}