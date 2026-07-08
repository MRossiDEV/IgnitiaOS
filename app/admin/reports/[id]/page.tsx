"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Shield,
  ArrowLeft,
} from "lucide-react";

type Report = {
  id: string;
  business_name: string;
  company_name: string;
  business_website: string;
  industry: string;
  created_at: string;
  audit_date: string;
  report_slug: string;
  overall_score: number;
  ai_score: number;
  seo_score: number;
  social_score: number;
  ads_score: number;
  branding_score: number;
  crm_score: number;
  automation_score: number;
  google_score: number;
  website_score: number;
  ai_summary: string;
  executive_summary: string;
  business_size: string;
  estimated_monthly_leads: number;
  estimated_monthly_revenue: number;
  estimated_conversion_rate: number;
  estimated_roi: number;
  opportunities?: string[];
  quick_wins?: string[];
  recommended_services?: string[];
  strengths?: string[];
  weaknesses?: string[];
  threats?: string[];
  conversion_analysis?: {
    lead_quality: string;
    conversion_rate: string;
    checkout_friction: string;
  };
  seo_analysis?: {
    keywords: string;
    backlinks: string;
    technical: string;
  };
  social_analysis?: {
    ads: string;
    posting: string;
    engagement: string;
  };
  funnel_analysis?: {
    awareness_stage: string;
    consideration_stage: string;
    decision_stage: string;
  };
  lead_generation_analysis?: {
    seo_traffic: string;
    paid_ads: string;
    referrals: string;
  };
  google_business_analysis?: {
    ranking: string;
    visibility: string;
    reviews: string;
  };
  website_analysis?: {
    ux: string;
    mobile: string;
    performance: string;
  };
  roadmap?: {
    phase_1: string[];
    phase_2: string[];
    phase_3: string[];
  };
  screenshots?: string[];
  pdf_url?: string;
  status: string;
};

export default function ReportPage() {
  const params = useParams();
  const reportId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id ||
      (Array.isArray(params?.report_slug)
        ? params.report_slug[0]
        : params?.report_slug);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/reports/${reportId}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch report");

        const reportData = data.report || data;
        setReport(reportData);
      } catch (err) {
        console.error("Error loading report:", err);
        setReport(null);
      } finally {
        setLoading(false);
      }
    }

    if (reportId) {
      load();
    } else {
      setLoading(false);
    }
  }, [reportId]);

  const panelClass = "rounded-2xl border border-white/10 bg-white/5 p-6";

  if (loading) {
    return (
      <div className="p-6 text-white">
        <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Loader2 className="animate-spin text-cyan-400" size={40} />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 text-white">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-10 text-center text-red-300">
          Report not found or failed to load.
        </div>
      </div>
    );
  }

  const renderListSection = (
    title: string,
    items: string[] | undefined,
    icon: "check" | "trend" | "alert" | "brain",
    toneClass: string
  ) => {
    if ((items?.length ?? 0) === 0) return null;

    const Icon =
      icon === "check"
        ? CheckCircle2
        : icon === "trend"
        ? TrendingUp
        : icon === "brain"
        ? Brain
        : AlertTriangle;

    return (
      <div className={panelClass}>
        <h2 className={`flex items-center gap-2 text-xl font-bold ${toneClass}`}>
          <Icon size={18} />
          {title}
        </h2>

        <ul className="mt-4 space-y-2 text-zinc-300">
          {(items ?? []).map((item, i) => (
            <li key={i} className="flex gap-2 rounded-lg border border-white/10 bg-black/20 p-3">
              <Icon className={`mt-0.5 shrink-0 ${toneClass}`} size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reports"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </Link>

          <div>
            <h1 className="text-3xl font-bold">Report Details</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {report.business_name} · {report.industry}
            </p>
          </div>
        </div>

        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-cyan-300">
          {report.status || "ready"}
        </span>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black">{report.business_name}</h2>
            <p className="mt-2 text-sm text-zinc-300">
              Generated on {new Date(report.audit_date).toLocaleString()}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
                {report.report_slug}
              </span>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300">
                {report.business_size || "N/A"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-zinc-400">Overall Score</p>
            <p className="text-4xl font-black text-cyan-400">{report.overall_score ?? "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <TrendingUp size={14} /> SEO Score
          </div>
          <p className="mt-2 text-2xl font-bold text-cyan-300">{report.seo_score ?? "N/A"}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Sparkles size={14} /> Conversion Rate
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-300">
            {report.estimated_conversion_rate !== null && report.estimated_conversion_rate !== undefined
              ? `${report.estimated_conversion_rate}%`
              : "N/A"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <TrendingUp size={14} /> Social Score
          </div>
          <p className="mt-2 text-2xl font-bold text-violet-300">{report.social_score ?? "N/A"}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Shield size={14} /> AI Score
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{report.ai_score ?? "N/A"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className={panelClass}>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Brain size={18} />
            Executive Summary
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-300">
            {report.executive_summary || "No executive summary available."}
          </p>
        </div>

        <div className={panelClass}>
          <h2 className="flex items-center gap-2 text-xl font-bold text-cyan-300">
            <Sparkles size={18} />
            AI Analysis
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-300">
            {report.ai_summary || "No AI analysis available."}
          </p>
        </div>
      </div>

      <div className={panelClass}>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
          <TrendingUp size={18} />
          Business Metrics
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-500">Est. Monthly Leads</p>
            <p className="mt-1 text-2xl font-bold text-cyan-300">
              {report.estimated_monthly_leads ?? "N/A"}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-500">Est. Monthly Revenue</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300">
              {report.estimated_monthly_revenue !== null && report.estimated_monthly_revenue !== undefined
                ? `$${report.estimated_monthly_revenue.toLocaleString()}`
                : "N/A"}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-500">Est. ROI</p>
            <p className="mt-1 text-2xl font-bold text-blue-300">
              {report.estimated_roi !== null && report.estimated_roi !== undefined
                ? `${report.estimated_roi}x`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {renderListSection("Quick Wins", report.quick_wins, "check", "text-blue-300")}
        {renderListSection("Growth Opportunities", report.opportunities, "trend", "text-emerald-300")}
        {renderListSection("Strengths", report.strengths, "check", "text-emerald-300")}
        {renderListSection("Weaknesses", report.weaknesses, "alert", "text-amber-300")}
        {renderListSection("Threats", report.threats, "alert", "text-red-300")}
        {renderListSection("Recommended Services", report.recommended_services, "brain", "text-violet-300")}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {report.seo_analysis && (
          <div className={panelClass}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <TrendingUp size={18} /> SEO Analysis
            </h2>
            <div className="space-y-4 text-zinc-300">
              <DetailRow label="Keywords" value={report.seo_analysis.keywords} />
              <DetailRow label="Backlinks" value={report.seo_analysis.backlinks} />
              <DetailRow label="Technical" value={report.seo_analysis.technical} />
            </div>
          </div>
        )}

        {report.conversion_analysis && (
          <div className={panelClass}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Sparkles size={18} /> Conversion Analysis
            </h2>
            <div className="space-y-4 text-zinc-300">
              <DetailRow label="Lead Quality" value={report.conversion_analysis.lead_quality} />
              <DetailRow label="Conversion Rate" value={report.conversion_analysis.conversion_rate} />
              <DetailRow label="Checkout Friction" value={report.conversion_analysis.checkout_friction} />
            </div>
          </div>
        )}

        {report.social_analysis && (
          <div className={panelClass}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Sparkles size={18} /> Social Media Analysis
            </h2>
            <div className="space-y-4 text-zinc-300">
              <DetailRow label="Ads" value={report.social_analysis.ads} />
              <DetailRow label="Posting Strategy" value={report.social_analysis.posting} />
              <DetailRow label="Engagement" value={report.social_analysis.engagement} />
            </div>
          </div>
        )}

        {report.funnel_analysis && (
          <div className={panelClass}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <TrendingUp size={18} /> Funnel Analysis
            </h2>
            <div className="space-y-4 text-zinc-300">
              <DetailRow label="Awareness Stage" value={report.funnel_analysis.awareness_stage} />
              <DetailRow label="Consideration Stage" value={report.funnel_analysis.consideration_stage} />
              <DetailRow label="Decision Stage" value={report.funnel_analysis.decision_stage} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1">{value || "N/A"}</p>
    </div>
  );
}