import React from "react";
import { TrendingUp } from "lucide-react";
import { ImpactCard } from "../ImpactCard";
import { Report } from "../../lib/types";
import { formatNumber } from "../../lib/utils";

interface ImpactSectionProps {
  report: Report;
}

export function ImpactSection({ report }: ImpactSectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-8 py-12">
      <div className="rounded-[36px] border border-green-500/20 bg-gradient-to-br from-green-500/10 to-cyan-500/5 p-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black">Estimated Business Impact</h2>

            <p className="mt-3 text-zinc-400">
              Potential results after implementing the recommendations.
            </p>
          </div>

          <TrendingUp size={46} className="text-green-400" />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <ImpactCard title="Estimated Monthly Leads" value={formatNumber(report.estimated_monthly_leads)} />

          <ImpactCard title="Estimated Conversion Rate" value={`${report.estimated_conversion_rate || 0}%`} />

          <ImpactCard title="Projected ROI" value={`${formatNumber(report.estimated_roi)}x`} />

          <ImpactCard title="Proposal Value" value={`$${formatNumber(report.proposal_value)}`} />
        </div>
      </div>
    </section>
  );
}
