"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  landingPages as mockLandingPages,
} from "@/lib/mock/landingPages";
import {
  partners as mockPartners,
} from "@/lib/mock/partners";
import {
  campaigns as mockCampaigns,
} from "@/lib/mock/campaigns";
import { LandingPage } from "@/lib/models/landingPage";

import {
  Search,
  Pencil,
  Eye,
  BarChart3,
  Copy,
  Trash2,
  Plus,
} from "lucide-react";

const calculateConversionRate = (page: LandingPage) => {
  if (!page.uniqueVisitors) return 0;
  return (page.conversions / page.uniqueVisitors) * 100;
};

const statusStyles: Record<string, string> = {
  published: "bg-green-500/10 text-green-400 border-green-500/20",
  draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

export default function LandingPagesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPages = useMemo(() => {
    return mockLandingPages.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalVisits = mockLandingPages.reduce((a, p) => a + p.visits, 0);
  const totalUnique = mockLandingPages.reduce((a, p) => a + p.uniqueVisitors, 0);
  const totalConversions = mockLandingPages.reduce((a, p) => a + p.conversions, 0);
  const avgConversionRate =
    totalUnique > 0 ? (totalConversions / totalUnique) * 100 : 0;

  const publishedPages = mockLandingPages.filter(
    (p) => p.status === "published"
  ).length;

  function action(label: string, id: string) {
    console.log(label, id);
  }

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Landing Pages</h1>
          <p className="text-zinc-500 text-sm">
            Manage funnels, conversions and landing experiments
          </p>
        </div>

        <Link
          href="/admin/landing-pages/new"
          className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded-xl font-semibold"
        >
          <Plus size={16} />
          New Landing Page
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        <KPI title="Total Pages" value={mockLandingPages.length} />
        <KPI title="Published" value={publishedPages} />
        <KPI title="Visits" value={totalVisits.toLocaleString()} />
        <KPI title="Conversions" value={totalConversions.toLocaleString()} />
        <KPI title="Avg Conv Rate" value={`${avgConversionRate.toFixed(2)}%`} />

      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">

        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-full md:w-[400px]">
          <Search size={16} className="text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search landing pages..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>

        <div className="flex gap-2">
          {["all", "published", "draft", "paused", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs border ${
                statusFilter === s
                  ? "bg-cyan-500 text-black border-cyan-500"
                  : "bg-white/5 border-white/10 text-zinc-400"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* GRID CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {filteredPages.map((page) => {
          const partner = mockPartners.find((p) => p.id === page.partnerId);
          const campaign = mockCampaigns.find((c) => c.id === page.campaignId);
          const convRate = calculateConversionRate(page);

          return (
            <div
              key={page.id}
              className="border border-white/10 bg-white/5 rounded-2xl p-5 hover:border-white/20 transition"
            >

              {/* HEADER */}
              <div className="flex justify-between items-start">

                <div>
                  <Link
                    href={`/admin/landing-pages/${page.id}`}
                    className="font-semibold text-lg hover:text-cyan-400"
                  >
                    {page.name}
                  </Link>

                  <p className="text-xs text-zinc-500">
                    /{page.slug}
                  </p>

                  <div className="text-xs text-zinc-400 mt-1">
                    {partner?.name || "No partner"} • {campaign?.name || "No campaign"}
                  </div>
                </div>

                <span
                  className={`text-xs px-2 py-1 rounded-full border capitalize ${
                    statusStyles[page.status] || ""
                  }`}
                >
                  {page.status}
                </span>
              </div>

              {/* METRICS */}
              <div className="grid grid-cols-4 gap-3 mt-4 text-xs">

                <Metric label="Visits" value={page.visits} />
                <Metric label="Unique" value={page.uniqueVisitors} />
                <Metric label="Conv" value={page.conversions} />
                <Metric label="Rate" value={`${convRate.toFixed(1)}%`} />

              </div>

              {/* FOOTER ACTIONS */}
              <div className="flex gap-2 mt-5">

                <ActionButton
                  icon={<Pencil size={14} />}
                  label="Edit"
                  href={`/admin/landing-pages/${page.id}/edit`}
                />

                <ActionButton
                  icon={<Eye size={14} />}
                  label="Preview"
                  href={`/admin/landing-pages/${page.id}/preview`}
                />

                <ActionButton
                  icon={<BarChart3 size={14} />}
                  label="Analytics"
                  onClick={() => action("analytics", page.id)}
                />

                <ActionButton
                  icon={<Copy size={14} />}
                  label="Duplicate"
                  onClick={() => action("duplicate", page.id)}
                />

                <ActionButton
                  icon={<Trash2 size={14} />}
                  label="Archive"
                  onClick={() => action("archive", page.id)}
                />

              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}

/* ---------------- UI COMPONENTS ---------------- */

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
      <p className="text-zinc-500 text-[10px]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  href,
  onClick,
}: any) {
  const base =
    "flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition";

  if (href) {
    return (
      <Link href={href} className={base}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={base}>
      {icon}
      {label}
    </button>
  );
}