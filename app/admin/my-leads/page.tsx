import Link from "next/link";

import {
  Search,
  Filter,
  Users,
  TrendingUp,
  DollarSign,
  Clock3,
  Eye,
  Mail,
  Phone,
  Globe,
} from "lucide-react";

import { supabaseAdmin } from "@/lib/supabase/server";
import LeadViews from "./LeadsView";

type Lead = {
  id: string;

  report_code: string;

  status: string;

  created_at: string;

  full_name: string;

  email: string;

  phone: string | null;

  business_name: string;

  website: string | null;

  industry: string | null;

  business_type: string | null;

  city: string | null;

  country: string | null;

  primary_goal: string | null;

  overall_score: number | null;

  executive_score: number | null;

  ai_summary: string | null;
};

function statusColor(status: string) {
    switch (status) {
    case "new":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
        
    case "completed":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

    case "processing":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";

    case "failed":
      return "bg-red-500/15 text-red-400 border-red-500/30";

    default:
      return "bg-zinc-700 text-zinc-300 border-zinc-600";
  }
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";

  if (score >= 60) return "text-yellow-400";

  return "text-red-400";
}

function estimateValue(score: number) {
  if (score >= 80) return 1500;

  if (score >= 60) return 900;

  if (score >= 40) return 500;

  return 250;
}

export default async function MyLeadsPage() {
  const { data, error } = await supabaseAdmin
        .from("free_reports")
        .select(`
            *,
            lead_crm (
            status,
            priority,
            owner,
            estimated_value,
            probability,
            follow_up
            )
        `)
        .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

    const leads = (data ?? []) as Lead[];

    console.log("Leads:", leads);

    /* Total value of all leads */
    function totalValue() {
        return leads.reduce((sum, lead) => {
            const value = lead.lead_crm?.estimated_value ?? 0;
            return sum + value;
        }, 0);
    }
    
    const newLead = leads.filter(
    (l) => l.status === "new"
    ).length;
    
    const failed = leads.filter(
        (l) => l.status === "failed"
      ).length;

  const processing = leads.filter(
    (l) => l.status === "processing"
  ).length;

  const completed = leads.filter(
    (l) => l.status === "completed"
  ).length;

  const avgScore =
    leads.length > 0
      ? Math.round(
          leads.reduce(
            (sum, l) =>
              sum + (l.overall_score ?? 0),
            0
          ) / leads.length
        )
      : 0;

  const potentialRevenue = leads.reduce(
    (sum, l) =>
      sum +
      estimateValue(
        l.overall_score ?? 0
      ),
    0
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-4xl font-bold">
            My Leads
          </h1>

          <p className="mt-2 text-zinc-400">
            Leads generated through the
            IgnitiaAI Free Business Report.
          </p>

        </div>

        <Link
          href="/admin/reports"
          className="rounded-xl border border-white/10 px-5 py-3 transition hover:border-blue-500"
        >
          Reports
        </Link>

      </div>

      {/* KPIs */}

      <div className="grid gap-6 lg:grid-cols-4">

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

          <div className="flex items-center justify-between">

            <Users className="text-blue-400" />

            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Total
            </span>

          </div>

          <h2 className="mt-6 text-4xl font-bold">
            {leads.length}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Total generated leads
          </p>

        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

          <div className="flex items-center justify-between">

            <Clock3 className="text-yellow-400" />

            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Processing
            </span>

          </div>

          <h2 className="mt-6 text-4xl font-bold">
            {processing}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            AI reports running
          </p>

        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

          <div className="flex items-center justify-between">

            <TrendingUp className="text-emerald-400" />

            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Avg Score
            </span>

          </div>

          <h2 className="mt-6 text-4xl font-bold">
            {avgScore}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Average business score
          </p>

        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

          <div className="flex items-center justify-between">

            <DollarSign className="text-green-400" />

            <span className="text-xs uppercase tracking-widest text-zinc-500">
              Pipeline
            </span>

          </div>

          <h2 className="mt-6 text-4xl font-bold">
            USD${totalValue().toLocaleString()}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Estimated opportunity
          </p>

        </div>

      </div>

      {/* Search */}

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">

        <div className="flex flex-col gap-4 lg:flex-row">

          <div className="relative flex-1">

            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />

            <input
              placeholder="Search company, website or owner..."
              className="h-12 w-full rounded-xl border border-white/10 bg-zinc-950 pl-11 pr-4 outline-none"
            />

          </div>

          <button className="flex h-12 items-center gap-2 rounded-xl border border-white/10 px-5">

            <Filter size={18} />

            Filters

          </button>

        </div>

      </div>

      {/* VIEW TABS */}
        <LeadViews leads={leads} />
          
      {/* Footer */}

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-900 px-6 py-4">

        <div className="text-sm text-zinc-500">
          Showing{" "}
          <span className="font-semibold text-white">
            {leads.length}
          </span>{" "}
          lead{leads.length !== 1 ? "s" : ""}
        </div>

        <div className="text-sm text-zinc-500">
          Completed:{" "}
          <span className="font-semibold text-emerald-400">
            {completed}
          </span>
        </div>

      </div>

    </div>
  );
}