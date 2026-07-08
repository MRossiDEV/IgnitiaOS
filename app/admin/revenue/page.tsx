"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  campaigns as mockCampaigns,
} from "@/lib/mock/campaigns";
import {
  marketplaceListings as mockListings,
} from "@/lib/mock/marketplaceListings";
import {
  creditTransactions as mockTransactions,
} from "@/lib/mock/creditTransactions";
import {
  partners as mockPartners,
} from "@/lib/mock/partners";

import {
  DollarSign,
  TrendingUp,
  Globe,
  CreditCard,
  Store,
  Activity,
  Search,
  ArrowUpRight,
} from "lucide-react";

/**
 * IGNITIAOS — REVENUE INTELLIGENCE CENTER (UPGRADED UI)
 * Multi-stream monetization tracking + partner intelligence
 */

type RevenueStream = "campaign" | "marketplace" | "credits";

type RevenueEvent = {
  id: string;
  stream: RevenueStream;
  partnerId: string;
  amount: number;
  description: string;
  reference?: string;
  date: string;
};

const streamStyles: Record<RevenueStream, string> = {
  campaign: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  marketplace: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  credits: "bg-green-500/10 text-green-400 border-green-500/20",
};

export default function RevenuePage() {
  const [search, setSearch] = useState("");

  const campaignEvents: RevenueEvent[] = mockCampaigns
    .filter((c) => c.revenue > 0)
    .map((c) => ({
      id: `camp_${c.id}`,
      stream: "campaign",
      partnerId: c.partnerId,
      amount: c.revenue,
      description: c.name,
      reference: c.id,
      date: c.endDate || c.startDate,
    }));

  const marketplaceEvents: RevenueEvent[] = mockListings
    .filter((l) => l.status === "sold")
    .map((l) => ({
      id: `mkt_${l.id}`,
      stream: "marketplace",
      partnerId: l.partnerId,
      amount: l.price,
      description: `Sale: ${l.alias}`,
      reference: l.id,
      date: l.soldAt || l.listedAt,
    }));

  const creditEvents: RevenueEvent[] = mockTransactions
    .filter((t) => t.type === "purchase" && t.status === "completed")
    .map((t) => ({
      id: `cr_${t.id}`,
      stream: "credits",
      partnerId: t.partnerId,
      amount: t.amount,
      description: t.description,
      reference: t.reference,
      date: t.createdAt,
    }));

  const allEvents = useMemo(() => {
    return [...campaignEvents, ...marketplaceEvents, ...creditEvents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((e) =>
        e.description.toLowerCase().includes(search.toLowerCase())
      );
  }, [search]);

  const totalRevenue = allEvents.reduce((a, b) => a + b.amount, 0);

  const streamBreakdown = useMemo(() => {
    const campaign = campaignEvents.reduce((a, b) => a + b.amount, 0);
    const marketplace = marketplaceEvents.reduce((a, b) => a + b.amount, 0);
    const credits = creditEvents.reduce((a, b) => a + b.amount, 0);

    return [
      { stream: "campaign" as const, value: campaign },
      { stream: "marketplace" as const, value: marketplace },
      { stream: "credits" as const, value: credits },
    ];
  }, []);

  const max = Math.max(...streamBreakdown.map((s) => s.value), 1);

  const avgPerPartner =
    mockPartners.length > 0 ? totalRevenue / mockPartners.length : 0;

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Revenue Intelligence</h1>
          <p className="text-zinc-500 text-sm">
            Multi-stream monetization & partner extraction system
          </p>
        </div>

        <Link
          href="/admin/reports"
          className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded-xl font-semibold"
        >
          <ArrowUpRight size={16} />
          Reports
        </Link>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        <KPI title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={<DollarSign size={16} />} />
        <KPI title="Campaign" value={`$${streamBreakdown[0].value.toLocaleString()}`} icon={<TrendingUp size={16} />} />
        <KPI title="Marketplace" value={`$${streamBreakdown[1].value.toLocaleString()}`} icon={<Store size={16} />} />
        <KPI title="Credits" value={`$${streamBreakdown[2].value.toLocaleString()}`} icon={<CreditCard size={16} />} />
        <KPI title="Avg/Partner" value={`$${avgPerPartner.toFixed(0)}`} icon={<Activity size={16} />} />

      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 w-full md:w-[420px]">
        <Search size={16} className="text-zinc-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search revenue events..."
          className="bg-transparent outline-none w-full text-sm"
        />
      </div>

      {/* STREAM BREAKDOWN */}
      <div className="grid lg:grid-cols-2 gap-4">

        <div className="border border-white/10 bg-white/5 rounded-2xl p-5">
          <h2 className="font-bold text-lg mb-4">Revenue Streams</h2>

          <div className="space-y-4">
            {streamBreakdown.map((s) => (
              <div key={s.stream}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize">{s.stream}</span>
                  <span className="text-zinc-400">
                    ${s.value.toLocaleString()}
                  </span>
                </div>

                <div className="h-2 bg-white/10 rounded">
                  <div
                    className={`h-2 rounded ${
                      s.stream === "campaign"
                        ? "bg-purple-500"
                        : s.stream === "marketplace"
                        ? "bg-cyan-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${(s.value / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-white/10 bg-white/5 rounded-2xl p-5">
          <h2 className="font-bold text-lg mb-4">System Insight</h2>

          <p className="text-sm text-zinc-400">
            Revenue is distributed across three monetization layers:
            campaigns (execution layer), marketplace (asset layer), and credits
            (internal economy layer).
          </p>

          <div className="mt-4 text-xs text-zinc-500 space-y-1">
            <p>• Campaign revenue = execution output monetization</p>
            <p>• Marketplace revenue = asset liquidation</p>
            <p>• Credits revenue = platform internal economy</p>
          </div>
        </div>

      </div>

      {/* EVENTS TABLE */}
      <div className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden">

        <div className="p-5 border-b border-white/10">
          <h2 className="font-bold text-lg">Revenue Events</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/30">
              <tr>
                <th className="text-left p-4 text-zinc-400">Stream</th>
                <th className="text-left p-4 text-zinc-400">Partner</th>
                <th className="text-left p-4 text-zinc-400">Description</th>
                <th className="text-left p-4 text-zinc-400">Reference</th>
                <th className="text-left p-4 text-zinc-400">Amount</th>
              </tr>
            </thead>

            <tbody>
              {allEvents.map((e) => {
                const partner = mockPartners.find((p) => p.id === e.partnerId);

                return (
                  <tr
                    key={e.id}
                    className="border-t border-white/10 hover:bg-white/5"
                  >
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border capitalize ${
                          streamStyles[e.stream]
                        }`}
                      >
                        {e.stream}
                      </span>
                    </td>

                    <td className="p-4 text-zinc-300">
                      {partner?.name || "Unknown"}
                    </td>

                    <td className="p-4 text-zinc-400">
                      {e.description}
                    </td>

                    <td className="p-4 text-xs text-zinc-500 font-mono">
                      {e.reference || "—"}
                    </td>

                    <td className="p-4 font-bold text-green-400">
                      +${e.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}

/* ================= UI COMPONENTS ================= */

function KPI({ title, value, icon }: any) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-2xl p-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-zinc-500">{title}</p>
        <div className="text-cyan-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}