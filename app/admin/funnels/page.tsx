"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  MoreHorizontal,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Eye,
  MousePointer,
  ArrowRight,
  FunnelPlus,
  Sparkles,
  LayoutTemplate,
  Copy,
  Settings,
  BarChart3,
  Globe,
} from "lucide-react";

type FunnelStatus = "active" | "draft" | "paused" | "completed";

type FunnelItem = {
  id: string;
  name: string;
  industry: string;
  status: FunnelStatus;
  landingPages: number;
  visitors: number;
  leads: number;
  conversions: number;
  revenue: number;
  createdAt: string;
};



const mockFunnels: FunnelItem[] = [
  {
    id: "1",
    name: "Roofing Leads Funnel",
    industry: "Construction",
    status: "active",
    landingPages: 4,
    visitors: 12450,
    leads: 492,
    conversions: 61,
    revenue: 28750,
    createdAt: "2026-06-01",
  },
  {
    id: "2",
    name: "Solar Installation Funnel",
    industry: "Energy",
    status: "active",
    landingPages: 6,
    visitors: 9850,
    leads: 310,
    conversions: 47,
    revenue: 22600,
    createdAt: "2026-05-22",
  },
  {
    id: "3",
    name: "Immigration Services Funnel",
    industry: "Relocation",
    status: "draft",
    landingPages: 3,
    visitors: 0,
    leads: 0,
    conversions: 0,
    revenue: 0,
    createdAt: "2026-06-20",
  },
  {
    id: "4",
    name: "Business Consulting Funnel",
    industry: "Consulting",
    status: "paused",
    landingPages: 5,
    visitors: 6200,
    leads: 180,
    conversions: 19,
    revenue: 8200,
    createdAt: "2026-04-15",
  },
];

const statusColors: Record<FunnelStatus, string> = {
  active:
    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  draft: "bg-zinc-500/15 text-zinc-300 border border-zinc-500/20",
  paused: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20",
  completed: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20",
};

export default function FunnelsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredFunnels = useMemo(() => {
    return mockFunnels.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.industry.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || f.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const metrics = useMemo(() => {
    return {
      funnels: mockFunnels.length,
      visitors: mockFunnels.reduce((a, b) => a + b.visitors, 0),
      leads: mockFunnels.reduce((a, b) => a + b.leads, 0),
      revenue: mockFunnels.reduce((a, b) => a + b.revenue, 0),
      conversions: mockFunnels.reduce((a, b) => a + b.conversions, 0),
    };
  }, []);

  const conversionRate =
    metrics.leads > 0
      ? ((metrics.conversions / metrics.leads) * 100).toFixed(1)
      : "0";

  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-20">
        <div className="px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <FunnelPlus className="w-5 h-5" />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Funnel Management Center
                </h1>
                <p className="text-zinc-400 text-sm">
                  Build, optimize and scale lead generation funnels
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              AI Funnel Builder
            </button>

            <button className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center gap-2 text-sm">
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </button>

            <Link
              href="/admin/funnels/new"
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              New Funnel
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">Funnels</span>
              <div className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3 text-3xl font-bold">
              {metrics.funnels}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">Visitors</span>
              <Eye className="w-4 h-4 text-purple-400" />
            </div>
            <div className="mt-3 text-3xl font-bold">
              {metrics.visitors.toLocaleString()}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">Leads</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3 text-3xl font-bold">
              {metrics.leads.toLocaleString()}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3 text-3xl font-bold">
              ${metrics.revenue.toLocaleString()}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex justify-between">
              <span className="text-zinc-400 text-sm">Conversion</span>
              <Target className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="mt-3 text-3xl font-bold">
              {conversionRate}%
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid lg:grid-cols-4 gap-5">
          <button className="p-5 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 text-left hover:border-cyan-500/40 transition">
            <Sparkles className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="font-semibold">Generate Funnel with AI</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Create complete funnel structures automatically.
            </p>
          </button>

          <button className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] text-left hover:border-white/20 transition">
            <LayoutTemplate className="w-6 h-6 mb-3" />
            <h3 className="font-semibold">Templates Library</h3>
            <p className="text-sm text-zinc-400 mt-1">
              High-converting industry templates.
            </p>
          </button>

          <button className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] text-left hover:border-white/20 transition">
            <BarChart3 className="w-6 h-6 mb-3" />
            <h3 className="font-semibold">Performance Reports</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Deep funnel analytics and ROI tracking.
            </p>
          </button>

          <button className="p-5 rounded-3xl border border-white/10 bg-white/[0.03] text-left hover:border-white/20 transition">
            <Globe className="w-6 h-6 mb-3" />
            <h3 className="font-semibold">Publish Funnel</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Deploy funnels to custom domains.
            </p>
          </button>
        </div>

        {/* FILTER BAR */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col xl:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search funnels..."
                className="w-full h-11 bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-4 rounded-xl bg-black/30 border border-white/10"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>

            <button className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Advanced Filters
            </button>
          </div>
        </div>

        {/* FUNNELS LIST */}
        <div className="space-y-4">
          {filteredFunnels.map((funnel) => {
            const conversion =
              funnel.leads > 0
                ? ((funnel.conversions / funnel.leads) * 100).toFixed(1)
                : "0";

            return (
              <div
                key={funnel.id}
                className="rounded-3xl border border-white/10 bg-white/[0.03] hover:border-cyan-500/30 transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold">
                          {funnel.name}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[funnel.status]}`}
                        >
                          {funnel.status}
                        </span>

                        <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10">
                          {funnel.industry}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-5 gap-4 mt-5">
                        <div>
                          <div className="text-zinc-500 text-xs">
                            Landing Pages
                          </div>
                          <div className="font-semibold">
                            {funnel.landingPages}
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 text-xs">
                            Visitors
                          </div>
                          <div className="font-semibold">
                            {funnel.visitors.toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 text-xs">
                            Leads
                          </div>
                          <div className="font-semibold">
                            {funnel.leads.toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 text-xs">
                            Conversion
                          </div>
                          <div className="font-semibold text-cyan-400">
                            {conversion}%
                          </div>
                        </div>

                        <div>
                          <div className="text-zinc-500 text-xs">
                            Revenue
                          </div>
                          <div className="font-semibold text-emerald-400">
                            ${funnel.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5">
                        <div className="flex justify-between text-xs text-zinc-500 mb-2">
                          <span>Lead Conversion Progress</span>
                          <span>{conversion}%</span>
                        </div>

                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                            style={{ width: `${conversion}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>

                      <button className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2">
                        <Copy className="w-4 h-4" />
                        Clone
                      </button>

                      <button className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Analytics
                      </button>

                      <button className="h-10 px-4 rounded-xl border border-white/10 bg-white/5 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Edit
                      </button>

                      {funnel.status === "active" ? (
                        <button className="h-10 px-4 rounded-xl bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 flex items-center gap-2">
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      ) : (
                        <button className="h-10 px-4 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Activate
                        </button>
                      )}

                      <button className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-black/20 px-6 py-4 flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <MousePointer className="w-4 h-4" />
                    Traffic Source Tracking
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400">
                    <TrendingUp className="w-4 h-4" />
                    AI Optimization Enabled
                  </div>

                  <div className="flex items-center gap-2 text-zinc-400">
                    <ArrowRight className="w-4 h-4" />
                    Multi-Step Funnel Flow
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}