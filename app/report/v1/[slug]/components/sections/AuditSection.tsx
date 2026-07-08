import React from "react";
import { Globe, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { Report } from "../../lib/types";

interface AuditSectionProps {
  report: Report;
}

export function AuditSection({ report }: AuditSectionProps) {
  const websiteAnalysis = report.website_analysis || {};
  const conversionAnalysis = report.conversion_analysis || {};
  const socialAnalysis = report.social_analysis || {};
  const funnelAnalysis = report.funnel_analysis || {};
  const strengths = report.strengths || [];
  const weaknesses = report.weaknesses || [];
  const recommendedServices = report.recommended_services || [];

  return (
    <section className="mx-auto max-w-7xl px-8 py-12">
      <div className="rounded-[36px] border border-white/10 bg-white/5 p-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black">Website Audit</h2>

            <p className="mt-3 text-zinc-500">
              Technical and conversion analysis performed by Ignitia AI.
            </p>
          </div>

          <Globe className="text-cyan-400" size={42} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-7">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles size={18} />
                <h3 className="text-xl font-bold">Website Analysis</h3>
              </div>

              <div className="mt-5 space-y-3">
                {Object.entries(websiteAnalysis).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                      {key.replace(/_/g, " ")}
                    </div>
                    <p className="mt-2 text-zinc-300">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-7">
              <div className="flex items-center gap-2 text-cyan-300">
                <AlertTriangle size={18} />
                <h3 className="text-xl font-bold">Conversion Analysis</h3>
              </div>

              <div className="mt-5 space-y-3">
                {Object.entries(conversionAnalysis).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                      {key.replace(/_/g, " ")}
                    </div>
                    <p className="mt-2 text-zinc-300">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-7">
              <h3 className="text-xl font-bold text-green-300">Strengths</h3>
              <div className="mt-5 space-y-3">
                {strengths.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-green-500/20 bg-black/20 p-3">
                    <CheckCircle2 size={18} className="mt-1 text-green-400" />
                    <span className="text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-7">
              <h3 className="text-xl font-bold text-red-300">Weaknesses</h3>
              <div className="mt-5 space-y-3">
                {weaknesses.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-red-500/20 bg-black/20 p-3">
                    <AlertTriangle size={18} className="mt-1 text-red-400" />
                    <span className="text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-7">
              <h3 className="text-xl font-bold text-cyan-300">Recommended Services</h3>
              <div className="mt-5 space-y-3">
                {recommendedServices.map((item) => (
                  <div key={item} className="rounded-2xl border border-cyan-500/20 bg-black/20 p-3 text-zinc-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-7">
              <h3 className="text-xl font-bold text-cyan-300">Social & Funnel Signals</h3>
              <div className="mt-5 space-y-4">
                {Object.entries(socialAnalysis).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-cyan-500/20 bg-black/20 p-3">
                    <div className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                      {key.replace(/_/g, " ")}
                    </div>
                    <p className="mt-2 text-zinc-300">{String(value)}</p>
                  </div>
                ))}
                {Object.entries(funnelAnalysis).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-cyan-500/20 bg-black/20 p-3">
                    <div className="text-sm uppercase tracking-[0.25em] text-zinc-500">
                      {key.replace(/_/g, " ")}
                    </div>
                    <p className="mt-2 text-zinc-300">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
