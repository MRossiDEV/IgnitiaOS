"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Search, Loader2, ArrowUpRight } from "lucide-react";

type ReportRow = {
  id?: string;
  report_slug?: string;
  business_name?: string;
  industry?: string;
  report_code?: string;
  overall_score?: number;
  score?: number;
  estimated_monthly_revenue?: number;
  estimatedImpact?: number;
  status?: string;
  created_at?: string;
  audit_date?: string;
  metadata?: {
    usage?: {
      totalTokens?: number;
      cost?: number;
    };
  };
};

function formatCost(cost: number): string {
  if (cost > 0 && cost < 0.01) return "<$0.01";
  return `$${cost.toFixed(cost < 1 ? 4 : 2)}`;
}

const statusStyles: Record<string, string> = {
  ready: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  processing: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  failed: "border-red-500/20 bg-red-500/10 text-red-300",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/reports", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Failed to fetch reports");

        setReports(data.reports || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  const totalRevenue = reports.reduce(
    (acc, report) =>
      acc + Number(report.estimated_monthly_revenue ?? report.estimatedImpact ?? 0),
    0
  );

  const averageScore = reports.length
    ? reports.reduce((acc, report) => acc + Number(report.overall_score ?? report.score ?? 0), 0) /
      reports.length
    : 0;

  const totalAiCost = reports.reduce(
    (acc, report) => acc + Number(report.metadata?.usage?.cost ?? 0),
    0
  );

  const totalTokens = reports.reduce(
    (acc, report) => acc + Number(report.metadata?.usage?.totalTokens ?? 0),
    0
  );

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const normalizedQuery = query.toLowerCase();
      const matchesQuery =
        (report.business_name || "").toLowerCase().includes(normalizedQuery) ||
        (report.industry || "").toLowerCase().includes(normalizedQuery) ||
        (report.report_code || "").toLowerCase().includes(normalizedQuery);

      const normalizedStatus = (report.status || "ready").toLowerCase();
      const matchesStatus = statusFilter === "all" || normalizedStatus === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [reports, query, statusFilter]);

  return (
    <div className="space-y-6 p-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track generated business audits, scores, and revenue opportunities.
          </p>
        </div>

        <Link
          href="/admin/reports/new"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-black transition hover:bg-cyan-400"
        >
          <Plus size={16} />
          New Report
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Total Reports" value={reports.length.toString()} />
        <KpiCard title="Avg. Score" value={averageScore ? averageScore.toFixed(1) : "0.0"} />
        <KpiCard
          title="Est. AI Cost"
          value={formatCost(totalAiCost)}
          subtitle={`${totalTokens.toLocaleString()} tokens`}
        />
        <KpiCard title="Est. Monthly Revenue" value={`$${totalRevenue.toLocaleString()}`} />
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 md:w-[420px]">
          <Search size={16} className="text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by business, industry, or code..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "ready", "processing", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg border px-3 py-1 text-xs capitalize transition ${
                statusFilter === status
                  ? "border-cyan-500 bg-cyan-500 text-black"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center gap-3 text-zinc-400">
            <Loader2 size={20} className="animate-spin text-cyan-400" />
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-6 text-center">
            <FileText size={30} className="text-zinc-500" />
            <div>
              <p className="text-lg font-semibold">No reports found</p>
              <p className="mt-1 text-sm text-zinc-500">
                Try changing filters or create a new report.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-black/20 text-zinc-400">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Business</th>
                <th className="px-4 py-3 text-left font-medium">Code</th>
                <th className="px-4 py-3 text-left font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">AI Cost</th>
                <th className="px-4 py-3 text-left font-medium">Revenue</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Generated</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, index) => {
                const reportHref = `/admin/reports/${report.report_slug}`;
                const status = (report.status || "ready").toLowerCase();
                const rowKey = report.id ?? report.report_slug ?? report.report_code ?? `report-${index}`;

                return (
                  <tr key={rowKey} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <Link href={reportHref} className="group inline-flex items-center gap-2 font-medium hover:text-cyan-300">
                        {report.business_name || "Untitled report"}
                        <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                      </Link>
                      <p className="mt-0.5 text-xs text-zinc-500">{report.industry || "N/A"}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{report.report_slug || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-cyan-300">
                      {report.overall_score ?? report.score ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-amber-300">
                      {report.metadata?.usage?.cost
                        ? formatCost(Number(report.metadata.usage.cost))
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      ${Number(report.estimated_monthly_revenue ?? report.estimatedImpact ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs font-medium capitalize ${
                          statusStyles[status] || "border-white/10 bg-white/5 text-zinc-300"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {report.audit_date || report.created_at
                        ? new Date(report.audit_date || report.created_at || "").toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>}
    </div>
  );
}

