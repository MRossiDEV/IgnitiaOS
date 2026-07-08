import React from "react";
import { AlertTriangle, Rocket, XCircle, CheckCircle2, Sparkles } from "lucide-react";
import { Report } from "../../lib/types";

interface OpportunitiesSectionProps {
  report: Report;
}

export function OpportunitiesSection({ report }: OpportunitiesSectionProps) {
  const biggestProblems = report.weaknesses || report.threats || [];
  const growthOpportunities = report.opportunities || [];
  const quickWins = report.quick_wins || [];
  const recommendedServices = report.recommended_services || [];

  return (
    <section className="mx-auto max-w-7xl px-8 py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[36px] border border-red-500/20 bg-red-500/5 p-10">
          <div className="flex items-center gap-4">
            <AlertTriangle className="text-red-400" size={34} />

            <div>
              <h2 className="text-3xl font-black">Biggest Problems</h2>

              <p className="text-zinc-400">
                Areas costing your business money every month.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {biggestProblems.map((item: string) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-red-500/20 bg-black/30 p-5"
              >
                <XCircle className="mt-1 text-red-400" size={22} />

                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[36px] border border-green-500/20 bg-green-500/5 p-10">
          <div className="flex items-center gap-4">
            <Rocket className="text-green-400" size={34} />

            <div>
              <h2 className="text-3xl font-black">Growth Opportunities</h2>

              <p className="text-zinc-400">Quick wins with the highest ROI.</p>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {growthOpportunities.map((item: string) => (
              <div
                key={item}
                className="flex gap-4 rounded-2xl border border-green-500/20 bg-black/30 p-5"
              >
                <CheckCircle2 className="mt-1 text-green-400" size={22} />

                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[36px] border border-cyan-500/20 bg-cyan-500/5 p-8">
          <div className="flex items-center gap-3 text-cyan-300">
            <Sparkles size={22} />
            <h3 className="text-2xl font-bold">Quick Wins</h3>
          </div>

          <div className="mt-6 space-y-3">
            {quickWins.map((item: string) => (
              <div key={item} className="rounded-2xl border border-cyan-500/20 bg-black/20 p-4 text-zinc-300">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[36px] border border-cyan-500/20 bg-cyan-500/5 p-8">
          <div className="flex items-center gap-3 text-cyan-300">
            <Rocket size={22} />
            <h3 className="text-2xl font-bold">Recommended Services</h3>
          </div>

          <div className="mt-6 space-y-3">
            {recommendedServices.map((item: string) => (
              <div key={item} className="rounded-2xl border border-cyan-500/20 bg-black/20 p-4 text-zinc-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
