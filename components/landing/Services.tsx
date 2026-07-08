"use client";

import { motion } from "framer-motion";
import {
  Bot,
    Users,
    Megaphone,
    Code2,
    Share2,
    BarChart3,
} from "lucide-react";

  const services = [
    {
      icon: <Megaphone size={28} />,
      title: "Demand Generation",
      description: "We create and run complete lead generation campaigns — landing pages, ads, SEO, and AI-powered funnels that deliver qualified prospects.",
    },
    {
      icon: <Users size={28} />,
      title: "Lead Qualification & Enrichment",
      description: "Our AI team qualifies, scores, and enriches leads so you only receive high-intent buyers ready to talk.",
    },
    {
      icon: <Code2 size={28} />,
      title: "Websites & Conversion Systems",
      description: "We design and build high-converting websites, funnels, and tools tailored to your business.",
    },
    {
      icon: <Share2 size={28} />,
      title: "Content & Social Media",
      description: "Strategic content systems and social campaigns that attract your ideal customers consistently.",
    },
    {
      icon: <BarChart3 size={28} />,
      title: "Growth Strategy & Analytics",
      description: "Full marketing strategy, performance tracking, and optimization — we manage it end-to-end.",
    },
    {
      icon: <Bot size={28} />,
      title: "AI Automation",
      description: "We build and run automated workflows for follow-ups, nurturing, and operations.",
    },
  ];

export default function Services() {
    return (
      <section id="services" className="max-w-7xl mx-auto px-6 py-28 border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black">What We Deliver For You</h2>
          <p className="mt-4 text-xl text-zinc-400 max-w-2xl mx-auto">
            We handle strategy, execution, technology, and optimization — you receive consistent growth and qualified opportunities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/10 bg-zinc-950 p-9 hover:border-cyan-500/30 transition-all"
            >
              <div className="text-cyan-400">{service.icon}</div>
              <h3 className="mt-8 text-2xl font-bold">{service.title}</h3>
              <p className="mt-4 text-zinc-400 leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    );
}