"use client";

import { useMemo, useState } from "react";
import {
  leads as mockLeads,
} from "@/lib/mock/leads";
import {
  reports as mockReports,
} from "@/lib/mock/reports";

import {
  TrendingUp,
  Target,
  DollarSign,
  Activity,
  BarChart3,
  Search,
  ArrowUpRight,
  AlertTriangle,
  Globe,
} from "lucide-react";

/**
 * IGNITIAOS — ANALYTICS INTELLIGENCE CENTER (UPGRADED UI)
 * Funnel intelligence + attribution + performance systems
 */

export default function AnalyticsPage() {
  const [tab, setTab] = useState<"overview" | "funnel" | "sources" | "revenue">(
    "overview"
  );

  const funnelData = useMemo(() => {
    const totalLeads = mockLeads.length;
    const contacted = mockLeads.filter((l) => l.status !== "new").length;
    const qualified = mockLeads.filter(
      (l) => l.status === "qualified" || l.status === "converted"
    ).length;
    const converted = mockLeads.filter((l) => l.status === "converted").length;

    return {
      totalLeads,
      contacted,
      qualified,
      converted,
      contactRate: totalLeads ? (contacted / totalLeads) * 100 : 0,
      qualifyRate: contacted ? (qualified / contacted) * 100 : 0,
      convertRate: qualified ? (converted / qualified) * 100 : 0,
    };
  }, []);

  const sourcePerformance = useMemo(() => {
    const sources = ["audit", "manual", "referral", "campaign"] as const;

    return sources.map((source) => {
      const leads = mockLeads.filter((l) => l.source === source);
      const converted = leads.filter((l) => l.status === "converted").length;
      const revenue = converted * 500;

      return {
        source,
        leads: leads.length,
        converted,
        rate: leads.length ? (converted / leads.length) * 100 : 0,
        revenue,
      };
    });
  }, []);

  const industryPerformance = useMemo(() => {
    const industries = [
      ...new Set(mockLeads.map((l) => l.industry).filter(Boolean)),
    ] as string[];

    return industries.map((industry) => {
      const leads = mockLeads.filter((l) => l.industry === industry);
      const converted = leads.filter((l) => l.status === "converted").length;

      const avgValue =
        leads.length > 0
          ? leads.reduce((s, l) => s + (l.estimatedValue || 0), 0) /
            leads.length
          : 0;

      return {
        industry,
        leads: leads.length,
        converted,
        rate: leads.length ? (converted / leads.length) * 100 : 0,
        avgValue,
      };
    });
  }, []);

  const revenue = useMemo(() => {
    const paid = mockReports.filter((r) => r.type === "blueprint");
    return paid.length * 500;
  }, []);

  const totalConverted = mockLeads.filter(
    (l) => l.status === "converted"
  ).length;

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Intelligence</h1>
          <p className="text-zinc-500 text-sm">
            Revenue attribution + funnel leak detection system
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-[360px]">
          <Search size={16} className="text-zinc-400" />
          <input
            placeholder="Search insights..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap border-b border-white/10 pb-3">
        <Tab active={tab === "overview"} onClick={() => setTab("overview")} label="Overview" icon={<Activity size={14} />} />
        <Tab active={tab === "funnel"} onClick={() => setTab("funnel")} label="Funnel" icon={<Target size={14} />} />
        <Tab active={tab === "sources"} onClick={() => setTab("sources")} label="Sources" icon={<Globe size={14} />} />
        <Tab active={tab === "revenue"} onClick={() => setTab("revenue")} label="Revenue" icon={<DollarSign size={14} />} />
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          <KPI title="Total Leads" value={funnelData.totalLeads} icon={<Activity size={16} />} />
          <KPI title="Converted" value={totalConverted} icon={<Target size={16} />} />
          <KPI title="Conversion Rate" value={`${((totalConverted / funnelData.totalLeads) * 100).toFixed(1)}%`} icon={<TrendingUp size={16} />} />
          <KPI title="Revenue" value={`$${revenue.toLocaleString()}`} icon={<DollarSign size={16} />} />

        </div>
      )}

      {/* FUNNEL */}
      {tab === "funnel" && (
        <div className="border border-white/10 bg-white/5 rounded-2xl p-5 space-y-4">

          <h2 className="font-bold text-lg">Funnel Leakage Map</h2>

          <FunnelRow label="Total Leads" value={funnelData.totalLeads} rate={100} />
          <FunnelRow label="Contacted" value={funnelData.contacted} rate={funnelData.contactRate} />
          <FunnelRow label="Qualified" value={funnelData.qualified} rate={funnelData.qualifyRate} />
          <FunnelRow label="Converted" value={funnelData.converted} rate={funnelData.convertRate} />

        </div>
      )}

      {/* SOURCES */}
      {tab === "sources" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {sourcePerformance.map((s) => (
            <div key={s.source} className="border border-white/10 bg-white/5 rounded-2xl p-5">

              <div className="flex justify-between">
                <p className="font-semibold capitalize">{s.source}</p>
                <span className="text-xs text-zinc-500">{s.rate.toFixed(1)}%</span>
              </div>

              <div className="mt-3 grid grid-cols-3 text-xs gap-2">
                <Mini label="Leads" value={s.leads} />
                <Mini label="Conv" value={s.converted} />
                <Mini label="Rev" value={`$${s.revenue}`} />
              </div>

              <div className="mt-4 h-2 bg-white/10 rounded">
                <div className="h-2 bg-cyan-500 rounded" style={{ width: `${s.rate}%` }} />
              </div>

            </div>
          ))}

        </div>
      )}

      {/* REVENUE */}
      {tab === "revenue" && (
        <div className="space-y-4">

          <div className="border border-white/10 bg-white/5 rounded-2xl p-5">
            <h2 className="font-bold text-lg">Total Revenue Attribution</h2>
            <p className="text-3xl font-bold mt-2">${revenue.toLocaleString()}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {sourcePerformance.map((s) => (
              <div key={s.source} className="border border-white/10 bg-white/5 rounded-2xl p-5">

                <div className="flex justify-between">
                  <p className="capitalize font-semibold">{s.source}</p>
                  <p className="text-sm text-zinc-400">${s.revenue}</p>
                </div>

                <div className="mt-3 h-2 bg-white/10 rounded">
                  <div className="h-2 bg-green-500 rounded" style={{ width: `${(s.revenue / revenue) * 100}%` }} />
                </div>

              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

/* ================= COMPONENTS ================= */

function KPI({ title, value, icon }: any) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
      <div className="flex justify-between">
        <p className="text-xs text-zinc-500">{title}</p>
        <div className="text-cyan-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Tab({ active, onClick, label, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs border ${
        active
          ? "bg-cyan-500 text-black border-cyan-500"
          : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FunnelRow({ label, value, rate }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <p>{label}</p>
        <p className="text-zinc-400">
          {value} ({rate.toFixed ? rate.toFixed(1) : rate}%)
        </p>
      </div>
      <div className="h-2 bg-white/10 rounded mt-2">
        <div className="h-2 bg-purple-500 rounded" style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}

function Mini({ label, value }: any) {
  return (
    <div className="bg-black/30 border border-white/10 rounded-lg p-2 text-center">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}