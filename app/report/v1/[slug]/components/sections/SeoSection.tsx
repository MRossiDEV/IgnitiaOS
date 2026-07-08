import React from "react";
import { Search, MapPin, TrendingUp, Sparkles } from "lucide-react";
import { Report } from "../../lib/types";

interface SeoSectionProps {
  report: Report;
}

export function SeoSection({ report }: SeoSectionProps) {
  const seoAnalysis = report.seo_analysis || {};
  const googleAnalysis = report.google_business_analysis || {};
  const leadGeneration = report.lead_generation_analysis || {};

  return (
    <section className="mx-auto max-w-7xl px-8 py-12">
      <div className="rounded-[36px] border border-white/10 bg-white/5 p-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black">SEO Performance</h2>

            <p className="mt-3 text-zinc-500">
              Search engine optimization opportunities and local visibility insights.
            </p>
          </div>

          <Search className="text-cyan-400" size={42} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-7">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles size={18} />
              <h3 className="text-xl font-bold">SEO Signals</h3>
            </div>

            <div className="mt-5 space-y-3">
              {Object.entries(seoAnalysis).map(([key, value]) => (
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
              <MapPin size={18} />
              <h3 className="text-xl font-bold">Google Business Profile</h3>
            </div>

            <div className="mt-5 space-y-3">
              {Object.entries(googleAnalysis).map(([key, value]) => (
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

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-7">
          <div className="flex items-center gap-2 text-cyan-300">
            <TrendingUp size={18} />
            <h3 className="text-xl font-bold">Lead Generation Analysis</h3>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {Object.entries(leadGeneration).map(([key, value]) => (
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
    </section>
  );
}
