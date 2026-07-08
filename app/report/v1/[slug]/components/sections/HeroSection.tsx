import React from "react";
import { Building2, Globe, Target, DollarSign, TrendingUp, Users, Sparkles } from "lucide-react";
import { Report } from "../../lib/types";
import { scoreBg, scoreColor, formatNumber } from "../../lib/utils";
import { MetricCard } from "../MetricCard";

interface HeroSectionProps {
  report: Report;
}

export function HeroSection({ report }: HeroSectionProps) {
  const companyName = report.business_name || report.company_name || "Business Profile";
  const websiteValue = report.business_website || report.website || "Pending website";
  const locationValue = [report.city, report.state, report.country].filter(Boolean).join(", ");

  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,180,255,.18),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-8 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_420px]">
          <div>
            <div className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-cyan-300">
              Ignitia AI Business Intelligence Report
            </div>
            <h1 className="mt-8 text-6xl font-black leading-none">
              {companyName}
            </h1>

            <div className="mt-6 flex flex-wrap gap-6 text-zinc-400">
              <div className="flex items-center gap-2">
                <Building2 size={16} />
                {report.industry || "Industry pending"}
              </div>

              <div className="flex items-center gap-2">
                <Globe size={16} />
                {websiteValue}
              </div>

              <div className="flex items-center gap-2">
                <Target size={16} />
                {locationValue || "Location pending"}
              </div>
            </div>

            <p className="mt-10 max-w-3xl text-xl leading-9 text-zinc-400">
              {report.executive_summary || report.ai_summary || "AI-generated report summary will appear here."}
            </p>

            <div className="mt-6 flex items-center gap-2 text-sm text-cyan-300">
              <Sparkles size={16} />
              {report.ai_summary || "Additional AI insight available in the report data."}
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6">
              <MetricCard
                icon={<DollarSign size={22} />}
                title="Monthly Revenue"
                value={`$${formatNumber(report.estimated_monthly_revenue)}`}
              />

              <MetricCard
                icon={<TrendingUp size={22} />}
                title="Monthly Leads"
                value={formatNumber(report.estimated_monthly_leads)}
              />

              <MetricCard
                icon={<Users size={22} />}
                title="Estimated ROI"
                value={`${formatNumber(report.estimated_roi)}x`}
              />
            </div>
          </div>

          <div
            className={`rounded-[40px] border bg-gradient-to-b p-10 ${scoreBg(
              report.overall_score || 0
            )}`}
          >
            <div className="text-center">
              <p className="uppercase tracking-[0.3em] text-sm text-zinc-400">
                Overall Score
              </p>

              <div
                className={`mt-8 text-8xl font-black ${scoreColor(
                  report.overall_score || 0
                )}`}
              >
                {report.overall_score || 0}
              </div>

              <div className="text-3xl font-bold mt-3">/100</div>
            </div>

            <div className="my-10 h-px bg-white/10" />

            <button className="mt-10 w-full rounded-2xl bg-cyan-500 py-5 font-bold text-black hover:bg-cyan-400 transition">
              Schedule Strategy Session
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
