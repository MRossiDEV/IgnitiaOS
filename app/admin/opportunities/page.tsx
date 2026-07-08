"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Target,
  TrendingUp,
  Zap,
  Globe,
  BarChart3,
  Rocket,
  Brain,
  DollarSign,
  Flame,
  Layers,
} from "lucide-react";

/**
 * IGNITIAOS — OPPORTUNITIES ENGINE (STYLE MATCHED)
 * Landing-pages style UI adapted for opportunity discovery system
 */

type Opportunity = {
  id: string;
  title: string;
  niche: string;
  demand: number;
  competition: number;
  revenuePotential: number;
  status: "hot" | "warm" | "emerging" | "tested";
};

const mockOpportunities: Opportunity[] = [
  {
    id: "1",
    title: "Construction Leads - Montevideo",
    niche: "Home Services",
    demand: 92,
    competition: 35,
    revenuePotential: 15000,
    status: "hot",
  },
  {
    id: "2",
    title: "Real Estate Funnel Automation",
    niche: "Real Estate",
    demand: 78,
    competition: 55,
    revenuePotential: 12000,
    status: "warm",
  },
  {
    id: "3",
    title: "AI Marketing for Local Businesses",
    niche: "B2B Services",
    demand: 85,
    competition: 40,
    revenuePotential: 20000,
    status: "hot",
  },
];

const statusStyles: Record<string, string> = {
  hot: "bg-red-500/10 text-red-400 border-red-500/20",
  warm: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  emerging: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  tested: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return mockOpportunities.filter((o) => {
      const matchesSearch =
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.niche.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalRevenue = mockOpportunities.reduce(
    (a, o) => a + o.revenuePotential,
    0
  );

  const avgDemand =
    mockOpportunities.reduce((a, o) => a + o.demand, 0) /
    mockOpportunities.length;

  const avgCompetition =
    mockOpportunities.reduce((a, o) => a + o.competition, 0) /
    mockOpportunities.length;

  function action(label: string, id: string) {
    console.log(label, id);
  }

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Opportunity Engine</h1>
          <p className="text-zinc-500 text-sm">
            Market gaps, demand signals and monetization detection system
          </p>
        </div>

        <button className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded-xl font-semibold">
          <Zap size={16} />
          Scan Market
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <KPI title="Opportunities" value={mockOpportunities.length} />
        <KPI title="Total Potential" value={`$${totalRevenue.toLocaleString()}`} />
        <KPI title="Avg Demand" value={`${avgDemand.toFixed(0)}%`} />
        <KPI title="Avg Competition" value={`${avgCompetition.toFixed(0)}%`} />

      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-full md:w-[400px]">
          <Search size={16} className="text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search opportunities..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "hot", "warm", "emerging", "tested"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs border transition ${
                statusFilter === s
                  ? "bg-cyan-500 text-black border-cyan-500"
                  : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {filtered.map((o) => (
          <div
            key={o.id}
            className="border border-white/10 bg-white/5 rounded-2xl p-5 hover:border-white/20 transition"
          >

            {/* HEADER */}
            <div className="flex justify-between items-start">

              <div>
                <p className="font-semibold text-lg">{o.title}</p>
                <p className="text-xs text-zinc-500">{o.niche}</p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full border capitalize ${
                  statusStyles[o.status]
                }`}
              >
                {o.status}
              </span>

            </div>

            {/* METRICS */}
            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">

              <Metric label="Demand" value={`${o.demand}%`} />
              <Metric label="Competition" value={`${o.competition}%`} />
              <Metric label="Potential" value={`$${o.revenuePotential}`} />

            </div>

            {/* INSIGHT BAR */}
            <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-3">
              <p className="text-xs text-zinc-500">Opportunity Score</p>
              <div className="w-full bg-white/10 h-2 rounded mt-2">
                <div
                  className="h-2 bg-cyan-500 rounded"
                  style={{
                    width: `${o.demand - o.competition + 50}%`,
                  }}
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-5">

              <ActionButton
                label="Analyze"
                onClick={() => action("analyze", o.id)}
              />

              <ActionButton
                label="Build Funnel"
                onClick={() => action("funnel", o.id)}
              />

              <ActionButton
                label="Launch"
                onClick={() => action("launch", o.id)}
              />

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function KPI({ title, value }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Metric({ label, value }: any) {
  return (
    <div className="bg-black/30 border border-white/10 rounded-lg p-2 text-center">
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className="flex-1 text-xs px-2 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
    >
      {label}
    </button>
  );
}