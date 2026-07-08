"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

import {
  Search,
  Plus,
  Filter,
  RefreshCw,
  Rocket,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Target,
  BrainCircuit,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  LayoutGrid,
  Table2,
} from "lucide-react";

type Campaign = {
  id: string;
  name: string;
  objective: string | null;
  channel: string | null;
  status: string | null;
  budget: number;
  spent: number;
  revenue: number;
  impressions: number;
  clicks: number;
  leads: number;
  start_date: string | null;
  end_date: string |null;
  created_at: string;
};

const statusColor: Record<string, string> = {
  active:
    "bg-green-500/10 text-green-400 border-green-500/20",
  paused:
    "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  draft:
    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  completed:
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  archived:
    "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function CampaignsPage() {

  const [campaigns,setCampaigns]=useState<Campaign[]>([]);
  const [loading,setLoading]=useState(true);

  const [search,setSearch]=useState("");
  const [status,setStatus]=useState("all");
  const [view,setView]=useState<"cards"|"table">("cards");

  useEffect(()=>{
      loadCampaigns();
  },[]);

async function loadCampaigns() {
  setLoading(true);

  const { data, error, status } = await supabase
    .from("campaigns")
    .select("*");

  console.log("Status:", status);
  console.log("Error:", error);
  console.log("Data:", data);

  if (error) {
    console.error(error);
  } else {
    setCampaigns(data ?? []);
  }

  setLoading(false);
}

  const filtered=useMemo(()=>{

      return campaigns.filter(c=>{

          const matchesSearch=
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.channel?.toLowerCase().includes(search.toLowerCase());

          const matchesStatus=
          status==="all" || c.status===status;

          return matchesSearch && matchesStatus;

      });

  },[campaigns,search,status]);

  const stats=useMemo(()=>{

  const budget=campaigns.reduce((a,b)=>a+b.budget,0);
  const spent=campaigns.reduce((a,b)=>a+b.spent,0);
  const revenue=campaigns.reduce((a,b)=>a+b.revenue,0);
  const leads=campaigns.reduce((a,b)=>a+b.leads,0);
  const impressions=campaigns.reduce((a,b)=>a+b.impressions,0);
  const clicks=campaigns.reduce((a,b)=>a+b.clicks,0);

    return {
      budget,
          spent,
          revenue,
          leads,
          impressions,
          clicks,

          roi:
          spent===0
          ?0
          :((revenue-spent)/spent)*100,

          ctr:
          impressions===0
          ?0
          :(clicks/impressions)*100,

          active:
          campaigns.filter(c=>c.status==="active").length

      };

  },[campaigns]);

  return(

      <div className="space-y-8 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">

            Campaign Control Center

            </h1>
            <p className="mt-2 text-zinc-500">
              Enterprise AI Marketing Dashboard
            </p>        
          </div>        
          <div className="flex gap-3">

            <button
            onClick={loadCampaigns}
            className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10">

            <RefreshCw size={18}/>

            </button>

            <Link
            href="/admin/campaigns/new"
            className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black">

            <Plus size={18}/>

            New Campaign

            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-6">

          <KPI
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={<TrendingUp size={18}/>}
          />

          <KPI
            title="Budget"
            value={`$${stats.budget.toLocaleString()}`}
            icon={<DollarSign size={18}/>}
          />

          <KPI
            title="Spent"
            value={`$${stats.spent.toLocaleString()}`}
            icon={<Rocket size={18}/>}
          />

          <KPI
            title="ROI"
            value={`${stats.roi.toFixed(1)}%`}
            icon={
            stats.roi>=0
            ?<ArrowUpRight size={18}/>
            :<ArrowDownRight size={18}/>
            }
          />

          <KPI
            title="CTR"
            value={`${stats.ctr.toFixed(2)}%`}
            icon={<MousePointerClick size={18}/>}
          />

          <KPI
            title="Leads"
            value={stats.leads}
            icon={<Target size={18}/>}
          />
        </div>

        {/* TOP BAR */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 lg:w-[420px]">

            <Search size={18} className="text-zinc-500" />

            <input
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full bg-transparent outline-none placeholder:text-zinc-600"
            />

          </div>

          <div className="flex flex-wrap gap-2">

            {[
              "all",
              "active",
              "paused",
              "draft",
              "completed",
              "archived"
            ].map(s=>(

              <button
                key={s}
                onClick={()=>setStatus(s)}
                className={`rounded-xl border px-4 py-2 text-sm capitalize transition ${
                  status===s
                  ? "border-cyan-400 bg-cyan-400 text-black"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >

                {s}

              </button>

            ))}

          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={()=>setView("cards")}
              className={`rounded-xl border p-3 ${
                view==="cards"
                ? "border-cyan-400 bg-cyan-400 text-black"
                : "border-white/10 bg-white/5"
              }`}
            >

              <LayoutGrid size={18}/>

            </button>

            <button
              onClick={()=>setView("table")}
              className={`rounded-xl border p-3 ${
                view==="table"
                ? "border-cyan-400 bg-cyan-400 text-black"
                : "border-white/10 bg-white/5"
              }`}
            >

              <Table2 size={18}/>

            </button>

          </div>

        </div>

        {/* AI INSIGHTS */}

        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-cyan-500 p-3 text-black">

                <BrainCircuit size={22}/>

              </div>

              <div>

                <h2 className="text-xl font-bold">

                  Ignitia AI Recommendations

                </h2>

                <p className="text-sm text-zinc-400">

                  Live optimization suggestions

                </p>

              </div>

            </div>

            <button className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-black">

              Optimize All

            </button>

          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">

            <Insight
              title="High ROI"
              text="2 campaigns exceed 250% ROI."
            />

            <Insight
              title="Budget Alert"
              text="One campaign has consumed 91% of its budget."
            />

            <Insight
              title="CTR Opportunity"
              text="LinkedIn campaigns are outperforming Google Ads by 18%."
            />

          </div>

        </div>

        {/* CAMPAIGNS */}

        {loading ? (

        <div className="grid gap-5 grid-cols-1 lg:grid-cols-1">

          {Array.from({length:6}).map((_,i)=>(

            <div
              key={i}
              className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/5"
            />

          ))}

        </div>

        ) : view==="cards" ? (

        <div className="grid gap-5 lg:grid-cols-1">

        {filtered.map(c=>{

        const roi=
        c.spent===0
        ?0
        :((c.revenue-c.spent)/c.spent)*100;

        const ctr=
        c.impressions===0
        ?0
        :(c.clicks/c.impressions)*100;

        const used=
        c.budget===0
        ?0
        :(c.spent/c.budget)*100;

        return(

        <div
        key={c.id}
        className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400/40">

        <div className="flex items-start justify-between">

        <div>

        <Link
        href={`/admin/campaigns/${c.id}`}
        className="text-xl font-bold hover:text-cyan-400">

        {c.name}

        </Link>

        <p className="mt-1 text-sm text-zinc-500">

        {c.channel} • {c.objective}

        </p>

        </div>

        <div className="flex items-center gap-2">

        <span
        className={`rounded-full border px-3 py-1 text-xs capitalize ${
        statusColor[c.status ?? "draft"]
        }`}
        >

        {c.status}

        </span>

        <button className="rounded-lg border border-white/10 p-2">

        <MoreHorizontal size={16}/>

        </button>

        </div>

        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <Metric
            label="Budget"
            value={`$${c.budget.toLocaleString()}`}
          />

          <Metric
            label="Spent"
            value={`$${c.spent.toLocaleString()}`}
          />

          <Metric
            label="Revenue"
            value={`$${c.revenue.toLocaleString()}`}
          />

          <Metric
            label="Leads"
            value={c.leads}
          />

        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">

          <Metric
            label="ROI"
            value={`${roi.toFixed(1)}%`}
          />

          <Metric
            label="CTR"
            value={`${ctr.toFixed(2)}%`}
          />

          <Metric
            label="Clicks"
            value={c.clicks.toLocaleString()}
          />

        </div>

        <div className="mt-6">

          <div className="mb-2 flex justify-between text-sm">

            <span className="text-zinc-500">

              Budget Usage

            </span>

            <span className="font-semibold">

              {used.toFixed(0)}%

            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-black/40">

            <div
              className={`h-full rounded-full transition-all ${
                used < 70
                  ? "bg-green-500"
                  : used < 90
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{
                width: `${Math.min(100, used)}%`,
              }}
            />

          </div>

        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">

          <button className="rounded-xl border border-white/10 bg-white/5 py-2 text-sm transition hover:bg-white/10">

            View

          </button>

          <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-2 text-sm text-cyan-300 transition hover:bg-cyan-500/20">

            Optimize

          </button>

          <button className="rounded-xl border border-green-500/30 bg-green-500/10 py-2 text-sm text-green-300 transition hover:bg-green-500/20">

            Scale

          </button>

          <button className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 py-2 text-sm text-yellow-300 transition hover:bg-yellow-500/20">

            Pause

          </button>

        </div>

        </div>

        );

        })}

      </div>

        ) : (

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">

        <table className="w-full">

        <thead className="border-b border-white/10 bg-black/20">

        <tr>

        <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-500">

        Campaign

        </th>

        <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-zinc-500">

        Status

        </th>

        <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-500">

        Budget

        </th>

        <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-500">

        Spent

        </th>

        <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-500">

        Revenue

        </th>

        <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-500">

        ROI

        </th>

        <th className="px-6 py-4 text-right text-xs uppercase tracking-wider text-zinc-500">

        Leads

        </th>

        <th className="px-6 py-4"></th>

        </tr>

        </thead>

        <tbody>

        {filtered.map((c)=>{

        const roi =
        c.spent===0
        ?0
        :((c.revenue-c.spent)/c.spent)*100;

        return(

        <tr
        key={c.id}
        className="border-t border-white/5 hover:bg-white/5 transition">

        <td className="px-6 py-5">

        <div>

        <Link
        href={`/admin/campaigns/${c.id}`}
        className="font-semibold hover:text-cyan-400">

        {c.name}

        </Link>

        <p className="mt-1 text-xs text-zinc-500">

        {c.channel}

        </p>

        </div>

        </td>

        <td className="px-6">

        <span
        className={`rounded-full border px-3 py-1 text-xs capitalize ${
        statusColor[c.status ?? "draft"]
        }`}
        >

        {c.status}

        </span>

        </td>

        <td className="px-6 text-right">

        ${c.budget.toLocaleString()}

        </td>

        <td className="px-6 text-right">

        ${c.spent.toLocaleString()}

        </td>

        <td className="px-6 text-right font-semibold text-green-400">

        ${c.revenue.toLocaleString()}

        </td>

        <td className={`px-6 text-right font-semibold ${
        roi>=0
        ? "text-green-400"
        : "text-red-400"
        }`}>

        {roi.toFixed(1)}%

        </td>

        <td className="px-6 text-right">

        {c.leads}

        </td>

        <td className="px-6">

        <button className="rounded-lg border border-white/10 p-2 hover:bg-white/10">

        <MoreHorizontal size={16}/>

        </button>

        </td>

        </tr>

        );

        })}

        </tbody>

        </table>

        </div>

              )}

{/* EMPTY */}

{!loading && filtered.length===0 && (

<div className="rounded-3xl border border-dashed border-white/10 bg-white/5 py-24 text-center">

<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10">

<Sparkles
className="text-cyan-400"
size={34}
/>

</div>

<h2 className="mt-6 text-2xl font-bold">

No Campaigns Found

</h2>

<p className="mt-3 text-zinc-500">

Try changing your filters or create a new campaign.

</p>

<Link
href="/admin/campaigns/new"
className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black">

<Plus size={18}/>

New Campaign

</Link>

</div>

)}

</div>

  );

}

/* ==========================================================
   COMPONENTS
========================================================== */

type KPIProps={
title:string;
value:string|number;
icon:React.ReactNode;
};

function KPI({
title,
value,
icon
}:KPIProps){

return(

<div className="rounded-3xl border border-white/10 bg-white/5 p-5">

<div className="flex items-center justify-between">

<p className="text-xs uppercase tracking-wider text-zinc-500">

{title}

</p>

<div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400">

{icon}

</div>

</div>

<h3 className="mt-4 text-3xl font-bold">

{value}

</h3>

</div>

);

}

type MetricProps={
label:string;
value:string|number;
};

function Metric({
label,
value
}:MetricProps){

return(

<div className="rounded-2xl border border-white/10 bg-black/30 p-3">

<p className="text-[10px] uppercase tracking-wide text-zinc-500">

{label}

</p>

<p className="mt-2 text-lg font-semibold">

{value}

</p>

</div>

);

}

type InsightProps={
title:string;
text:string;
};

function Insight({
title,
text
}:InsightProps){

return(

<div className="rounded-2xl border border-cyan-500/20 bg-black/20 p-5">

<div className="flex items-center gap-3">

<div className="rounded-lg bg-cyan-500/10 p-2">

<BrainCircuit
size={18}
className="text-cyan-400"
/>

</div>

<h3 className="font-semibold">

{title}

</h3>

</div>

<p className="mt-4 text-sm leading-6 text-zinc-400">

{text}

</p>

</div>

);

}