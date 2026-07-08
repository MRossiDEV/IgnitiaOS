'use client';

import { useMemo, useState } from 'react';
import {
  Globe, Shield, DollarSign, Heart, Cloud, Wifi, Sun, ArrowRight,
  MapPin, TrendingUp, MessageCircle, X, Send, Home, Users, Plane, Briefcase
} from 'lucide-react';

import Image from 'next/image';
import HeroSection from './components/Hero';
import CountryIntelligenceDashboard from './components/CountryIntelligenceDashboard';

type Message = { role: 'user' | 'assistant'; content: string };

export default function UruguayRelocationPortal() {
  const [income, setIncome] = useState(3500);
  const [timeline, setTimeline] = useState('6-12');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "¡Hola! I'm your Uruguay Relocation Assistant. Ask me about residency, costs, cities, healthcare, or anything else." }
  ]);
  const [input, setInput] = useState('');

  const score = useMemo(() => {
    let s = 68;
    if (income >= 2800) s += 12;
    if (income >= 4800) s += 10;
    if (timeline === '12+') s += 4;
    if (timeline === '0-3') s -= 4;
    return Math.min(98, Math.max(50, s));
  }, [income, timeline]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');

    setTimeout(() => {
      const q = input.toLowerCase();
      let reply = "Great question! Let me give you accurate, up-to-date information.";

      if (q.includes('cost') || q.includes('budget')) {
        reply = "Montevideo 2026 estimates:\n• Single comfortable: $2,200–$3,000\n• Couple: $3,200–$4,500\n• Family of 4: $4,800–$6,500\nRent is the biggest variable.";
      } else if (q.includes('residency') || q.includes('visa')) {
        reply = "Americans get 90 days visa-free. Temporary residency is straightforward with income proof (~$1,500+/month) or investment. Most get approved in 6–12 months.";
      } else if (q.includes('city') || q.includes('montevideo') || q.includes('punta')) {
        reply = "Montevideo: Urban, cultural. Punta del Este: Beach luxury. Colonia: Charming historic. Interior: Quiet & cheaper.";
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    }, 650);
  };

  return (
    <main className="bg-[#0A0F1C] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1C]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Sun className="text-[#FFCD00] w-7 h-7" />
            <span className="font-bold text-xl">Uruguay Move</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm">
            <a href="#engine" className="hover:text-[#FFCD00] transition">Match Engine</a>
            <a href="#regions" className="hover:text-[#FFCD00] transition">Regions</a>
            <a href="#cost" className="hover:text-[#FFCD00] transition">Cost of Living</a>
            <a href="#residency" className="hover:text-[#FFCD00] transition">Residency</a>
            <a href="#faq" className="hover:text-[#FFCD00] transition">FAQ</a>
          </div>
          <button
            onClick={() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#FFCD00] text-black px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-300 transition"
          >
            Get Full Report
          </button>
        </div>
      </nav>

      {/* HERO */}
      <HeroSection />

      {/* INTELLIGENCE DASHBOARD */}
      <CountryIntelligenceDashboard />

      {/* MATCH ENGINE */}
      <section id="engine" className="px-6 py-20 bg-[#0F1629]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Uruguay Fit Engine</h2>
          <p className="text-center text-white/60 mb-12">See how well Uruguay matches your lifestyle in real time</p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="p-10 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-sky-400" />
                <h3 className="text-2xl font-semibold">Your Compatibility Score</h3>
              </div>
              <div className="text-7xl font-bold text-sky-400 mb-3">{score}%</div>
              <div className="h-3 bg-white/10 rounded-full">
                <div className="h-full bg-gradient-to-r from-sky-400 to-cyan-400 transition-all duration-300" style={{ width: `${score}%` }} />
              </div>
            </div>

            <div className="p-10 rounded-3xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign className="text-[#FFCD00]" />
                <h3 className="text-2xl font-semibold">Monthly Budget Simulator</h3>
              </div>
              <div className="text-6xl font-bold text-[#FFCD00] mb-6">${income}</div>
              <input type="range" min="1500" max="9000" step="100" value={income} onChange={e => setIncome(+e.target.value)} className="w-full accent-[#FFCD00]" />
            </div>
          </div>

          <div className="max-w-md mx-auto mt-10">
            <label className="block text-sm mb-3 text-white/60">When do you want to move?</label>
            <select value={timeline} onChange={e => setTimeline(e.target.value)} className="w-full p-5 rounded-2xl bg-white/5 border border-white/20 text-lg">
              <option value="0-3">0–3 months</option>
              <option value="3-6">3–6 months</option>
              <option value="6-12">6–12 months</option>
              <option value="12+">12+ months</option>
            </select>
          </div>
        </div>
      </section>

      {/* REGIONS */}
      <section id="regions" className="px-6 py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Best Places to Live in Uruguay</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Montevideo", desc: "Capital city. Vibrant culture, great restaurants, international airport.", vibe: "Urban & Cultural" },
              { name: "Punta del Este", desc: "Luxury beach destination. Popular with expats and high-net-worth individuals.", vibe: "Beach & Luxury" },
              { name: "Colonia del Sacramento", desc: "Historic charm, relaxed pace, close to Buenos Aires.", vibe: "Historic & Peaceful" },
            ].map(city => (
              <div key={city.name} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#FFCD00]/40 transition">
                <MapPin className="w-10 h-10 text-[#FFCD00] mb-4" />
                <h3 className="text-2xl font-bold mb-2">{city.name}</h3>
                <p className="text-sky-400 text-sm mb-3">{city.vibe}</p>
                <p className="text-white/70">{city.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COST OF LIVING */}
      <section id="cost" className="px-6 py-20 bg-[#0F1629]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Cost of Living in Uruguay (2026)</h2>
          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                ["Rent (1-bed apartment, city center)", "$650 – $1,200"],
                ["Groceries (single person)", "$350 – $480"],
                ["Dining out (meal for two)", "$45 – $70"],
                ["Utilities", "$120 – $180"],
                ["Private Health Insurance", "$80 – $160"],
              ].map(([item, price]) => (
                <div key={item} className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span>{item}</span>
                  <span className="font-semibold text-[#FFCD00]">{price}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-10">
              <h3 className="text-2xl font-semibold mb-6">Quick Summary</h3>
              <ul className="space-y-4 text-lg">
                <li className="flex gap-3"><span className="text-emerald-400">✓</span> Significantly cheaper than Miami or NYC</li>
                <li className="flex gap-3"><span className="text-emerald-400">✓</span> High quality of life for the price</li>
                <li className="flex gap-3"><span className="text-emerald-400">✓</span> Strong USD purchasing power</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* RESIDENCY */}
      <section id="residency" className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Residency & Visa Guide</h2>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 space-y-8">
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><Plane className="text-sky-400" /> Entry</h3>
                <p>90 days visa-free for Americans</p>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-4 flex items-center gap-2"><Home className="text-sky-400" /> Temporary Residency</h3>
                <p>Income proof or investment route • 6-12 months processing</p>
              </div>
            </div>
            <button className="mt-8 bg-[#FFCD00] text-black px-10 py-5 rounded-2xl font-semibold">
              Get Personalized Residency Roadmap
            </button>
          </div>
        </div>
      </section>

      {/* OTHER SECTIONS (Healthcare, Safety, etc.) */}
      <section className="px-6 py-20 bg-[#0F1629]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <DataCard icon={<Heart />} title="Healthcare" text="High-quality, affordable system. Private mutualista plans are excellent value." />
          <DataCard icon={<Shield />} title="Safety" text="Consistently ranked among the safest countries in Latin America." />
          <DataCard icon={<Briefcase />} title="Work & Remote" text="Remote work is very common. Growing tech and services sector." />
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="report" className="px-6 py-28 text-center bg-gradient-to-b from-[#002B7F]/30 to-transparent">
        <h2 className="text-5xl font-bold mb-6">Ready to Make the Move?</h2>
        <p className="text-xl text-white/70 max-w-xl mx-auto mb-10">Get your personalized 15-page relocation report with costs, residency steps, and expert connections.</p>
        <button className="bg-[#FFCD00] text-black px-14 py-7 rounded-2xl text-xl font-semibold hover:bg-yellow-300 transition">
          Generate My Free Report Now
        </button>
      </section>

      {/* Floating AI Assistant */}
      <div className="fixed bottom-6 right-6 z-50">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-[#002B7F] w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition">
          <MessageCircle className="w-8 h-8" />
        </button>

        {isChatOpen && (
          <div className="absolute bottom-20 right-0 w-96 bg-[#0F1629] border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
            {/* Chat header and content same as previous version */}
            <div className="p-4 border-b border-white/10 flex justify-between bg-[#002B7F]">
              <div className="flex items-center gap-3">
                <Sun className="text-[#FFCD00]" />
                <div>Uruguay AI Assistant</div>
              </div>
              <button onClick={() => setIsChatOpen(false)}><X /></button>
            </div>

            <div className="h-96 p-4 overflow-y-auto space-y-4 text-sm" id="chat-window">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : ''}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${m.role === 'user' ? 'bg-sky-600' : 'bg-white/10'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 flex gap-2 border-t border-white/10">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything about Uruguay..."
                className="flex-1 bg-white/5 border border-white/20 rounded-2xl px-5 py-3 focus:outline-none"
              />
              <button onClick={handleSend} className="bg-[#FFCD00] text-black p-3 rounded-2xl"><Send /></button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function DataCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-[#FFCD00]/30 transition">
      <div className="text-[#FFCD00] mb-5">{icon}</div>
      <h3 className="text-2xl font-semibold mb-3">{title}</h3>
      <p className="text-white/70">{text}</p>
    </div>
  );
}