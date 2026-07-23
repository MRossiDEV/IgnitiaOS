"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Shield,
  ArrowLeft,
  RefreshCw,
  Coins,
  Cpu,
  FileDown,
  Eye,
  X,
} from "lucide-react";

// Mirrors ReportSection in lib/ai/report-builder/ReportBuilder.ts
type ReportSection = {
  key: string;
  label: string;
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  quickWins: string[];
  findings?: unknown[];
};

// List items can be plain strings (pipeline output) or {section,text}
// objects (some legacy rows) — normalize both to a display string.
type ListItem = string | { section?: string; text?: string; title?: string };

type Report = {
  id: string;
  business_name: string;
  business_website: string;
  industry: string;
  created_at: string;
  audit_date: string;
  report_slug: string;
  status: string;

  overall_score: number;
  website_score: number;
  seo_score: number;
  google_score: number;
  social_score: number;
  branding_score: number;
  ai_score: number;

  executive_summary?: string;
  ai_summary?: string;
  business_size?: string;

  strengths?: ListItem[];
  weaknesses?: ListItem[];
  opportunities?: ListItem[];
  threats?: ListItem[];
  quick_wins?: ListItem[];
  recommended_services?: ListItem[];

  estimated_monthly_leads?: number;
  estimated_conversion_rate?: number;
  estimated_monthly_revenue?: number;
  estimated_roi?: number;

  metadata?: {
    report?: { sections?: ReportSection[]; overallScore?: number };
    sections?: ReportSection[];
    error?: string;
    progress?: {
      completed: number;
      total: number;
      stage: string;
      label: string;
    };
    usage?: UsageSummary;
  };
};

type UsageSummary = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  model?: string;
  byAgent: {
    agent: string;
    model?: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
  }[];
};

function formatCost(cost: number): string {
  if (cost > 0 && cost < 0.01) return "<$0.01";
  return `$${cost.toFixed(cost < 1 ? 4 : 2)}`;
}

function formatTokens(n: number): string {
  return n.toLocaleString();
}

const PROCESSING_STATUSES = new Set(["queued", "processing", "collecting", "draft"]);

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-cyan-300";
  if (score >= 40) return "text-amber-300";
  return "text-red-300";
}

function toText(item: ListItem): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    if (item.section && item.text) return `${item.section}: ${item.text}`;
    if (item.text) return item.text;
    if (item.title) return item.title;
  }
  return String(item ?? "");
}

function normalizeList(items?: ListItem[]): string[] {
  if (!Array.isArray(items)) return [];
  return items.map(toText).filter(Boolean);
}

export default function ReportPage() {
  const params = useParams();
  const reportId = Array.isArray(params?.id)
    ? params.id[0]
    : (params?.id as string | undefined);

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  // Bumped after a regenerate so the polling effect re-arms itself.
  const [reloadNonce, setReloadNonce] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!reportId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/v1/reports/${reportId}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch report");

        const reportData: Report = data.report || data;
        if (cancelled) return;
        setReport(reportData);

        const status = (reportData.status || "").toLowerCase();
        if (!PROCESSING_STATUSES.has(status) && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch (err) {
        console.error("Error loading report:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    pollRef.current = setInterval(load, 4000);

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, reloadNonce]);

  async function handleRegenerate() {
    if (!report) return;
    setRegenerating(true);
    setRegenError(null);
    try {
      const res = await fetch("/api/v1/reports/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to regenerate");

      // Optimistically flip to a processing state and re-arm polling.
      setReport((prev) =>
        prev
          ? { ...prev, status: "queued", metadata: { ...prev.metadata, error: undefined, progress: undefined } }
          : prev
      );
      setReloadNonce((n) => n + 1);
    } catch (err: any) {
      setRegenError(err.message || "Failed to regenerate");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDownloadPdf() {
    if (!report) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      const res = await fetch("/api/v1/reports/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="?([^"]+)"?/);
      const a = document.createElement("a");
      a.href = url;
      a.download = match?.[1] || "client-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setPdfError(err.message || "Failed to generate PDF");
    } finally {
      setPdfLoading(false);
    }
  }

  async function handlePreview(refresh = false) {
    if (!report) return;
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewError(null);
    if (refresh) setPreviewHtml(null);
    try {
      const res = await fetch("/api/v1/reports/pdf/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: report.id, refresh }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to render preview");
      }
      setPreviewHtml(await res.text());
    } catch (err: any) {
      setPreviewError(err.message || "Failed to render preview");
    } finally {
      setPreviewLoading(false);
    }
  }

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

  const status = (report.status || "ready").toLowerCase();
  const isProcessing = PROCESSING_STATUSES.has(status);
  const isFailed = status === "failed";

  const sections: ReportSection[] =
    report.metadata?.report?.sections ?? report.metadata?.sections ?? [];
  const overallScore = report.overall_score ?? report.metadata?.report?.overallScore ?? 0;

  const scoreTiles = [
    { label: "Website", value: report.website_score },
    { label: "SEO", value: report.seo_score },
    { label: "Social", value: report.social_score },
    { label: "Google", value: report.google_score },
    { label: "Branding", value: report.branding_score },
    { label: "AI", value: report.ai_score },
  ].filter((t) => typeof t.value === "number" && t.value > 0);

  const usage = report.metadata?.usage;

  const hasMetrics =
    report.estimated_monthly_leads != null ||
    report.estimated_monthly_revenue != null ||
    report.estimated_roi != null ||
    report.estimated_conversion_rate != null;

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

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${
              isFailed
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : isProcessing
                ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {status}
          </span>

          <button
            onClick={() => handlePreview(false)}
            disabled={previewLoading || isProcessing || sections.length === 0}
            title="Preview the client report as the client will see it"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Eye size={16} />
            Preview
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading || isProcessing || sections.length === 0}
            title="Generate a polished, client-ready PDF report"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown size={16} className={pdfLoading ? "animate-pulse" : ""} />
            {pdfLoading ? "Designing PDF…" : "Client PDF"}
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isProcessing || regenerating}
            title="Re-run the AI specialists and refresh this report's data"
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={regenerating ? "animate-spin" : ""} />
            {regenerating ? "Starting…" : "Regenerate"}
          </button>
        </div>
      </div>

      {pdfError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {pdfError}
        </div>
      )}

      {regenError && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {regenError}
        </div>
      )}

      {isProcessing && (
        <ProgressPanel progress={report.metadata?.progress} status={status} />
      )}

      {isFailed && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200">
          <AlertTriangle className="mt-0.5" size={20} />
          <div>
            <p className="font-semibold">Report generation failed</p>
            <p className="text-sm text-red-200/80">
              {report.metadata?.error ||
                "An unknown error occurred while running the pipeline."}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black">{report.business_name}</h2>
            {report.audit_date && (
              <p className="mt-2 text-sm text-zinc-300">
                Audit date: {new Date(report.audit_date).toLocaleDateString()}
              </p>
            )}
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
            <p className={`text-4xl font-black ${scoreTone(overallScore)}`}>
              {overallScore || (isProcessing ? "…" : "N/A")}
            </p>
          </div>
        </div>
      </div>

      {scoreTiles.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {scoreTiles.map((tile) => (
            <div key={tile.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Shield size={14} /> {tile.label}
              </div>
              <p className={`mt-2 text-2xl font-bold ${scoreTone(tile.value)}`}>
                {tile.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {(report.executive_summary || report.ai_summary) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {report.executive_summary && (
            <div className={panelClass}>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Brain size={18} />
                Executive Summary
              </h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-300">
                {report.executive_summary}
              </p>
            </div>
          )}

          {report.ai_summary && (
            <div className={panelClass}>
              <h2 className="flex items-center gap-2 text-xl font-bold text-cyan-300">
                <Sparkles size={18} />
                AI Summary
              </h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-zinc-300">
                {report.ai_summary}
              </p>
            </div>
          )}
        </div>
      )}

      {usage && usage.totalTokens > 0 && <UsagePanel usage={usage} />}

      {hasMetrics && (
        <div className={panelClass}>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <TrendingUp size={18} />
            Business Metrics
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Metric label="Est. Monthly Leads" value={report.estimated_monthly_leads} />
            <Metric
              label="Est. Monthly Revenue"
              value={report.estimated_monthly_revenue}
              format={(v) => `$${v.toLocaleString()}`}
            />
            <Metric label="Est. ROI" value={report.estimated_roi} format={(v) => `${v}x`} />
            <Metric
              label="Est. Conversion Rate"
              value={report.estimated_conversion_rate}
              format={(v) => `${v}%`}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ListSection title="Quick Wins" items={normalizeList(report.quick_wins)} icon="zap" tone="text-blue-300" />
        <ListSection title="Growth Opportunities" items={normalizeList(report.opportunities)} icon="trend" tone="text-emerald-300" />
        <ListSection title="Strengths" items={normalizeList(report.strengths)} icon="check" tone="text-emerald-300" />
        <ListSection title="Weaknesses" items={normalizeList(report.weaknesses)} icon="alert" tone="text-amber-300" />
        <ListSection title="Threats" items={normalizeList(report.threats)} icon="alert" tone="text-red-300" />
        <ListSection title="Recommended Services" items={normalizeList(report.recommended_services)} icon="brain" tone="text-violet-300" />
      </div>

      {sections.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold">Specialist Analysis</h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sections.map((section) => (
              <SectionCard key={section.key} section={section} />
            ))}
          </div>
        </div>
      )}

      {previewOpen && (
        <ReportPreviewModal
          html={previewHtml}
          loading={previewLoading}
          error={previewError}
          onClose={() => setPreviewOpen(false)}
          onRefresh={() => handlePreview(true)}
          onDownload={handleDownloadPdf}
          downloading={pdfLoading}
        />
      )}
    </div>
  );
}

function ReportPreviewModal({
  html,
  loading,
  error,
  onClose,
  onRefresh,
  onDownload,
  downloading,
}: {
  html: string | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[92vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2 text-white">
            <Eye size={16} className="text-cyan-300" />
            <span className="font-semibold">Client Report Preview</span>
            <span className="text-xs text-zinc-500">— what the client receives</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Rewrite the narrative with AI"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Rewrite
            </button>
            <button
              onClick={onDownload}
              disabled={downloading || loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <FileDown size={13} />
              {downloading ? "Preparing…" : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-auto bg-zinc-200">
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#0b1220]/80 text-zinc-200">
              <Loader2 className="animate-spin text-cyan-400" size={32} />
              <p className="text-sm">Designing the report…</p>
            </div>
          )}
          {error ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-red-300">
              {error}
            </div>
          ) : (
            <iframe
              title="Client report preview"
              sandbox=""
              srcDoc={html ?? ""}
              className="h-full w-full border-0 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function UsagePanel({ usage }: { usage: UsageSummary }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Coins size={18} className="text-amber-300" />
          Tokens &amp; Cost
        </h2>
        {usage.model && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300">
            <Cpu size={12} /> {usage.model}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <UsageTile label="Estimated Cost" value={formatCost(usage.cost)} tone="text-amber-300" />
        <UsageTile label="Total Tokens" value={formatTokens(usage.totalTokens)} tone="text-cyan-300" />
        <UsageTile label="Input Tokens" value={formatTokens(usage.inputTokens)} tone="text-zinc-200" />
        <UsageTile label="Output Tokens" value={formatTokens(usage.outputTokens)} tone="text-zinc-200" />
      </div>

      {usage.byAgent.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-black/20 text-zinc-400">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Specialist</th>
                <th className="px-4 py-2 text-right font-medium">Input</th>
                <th className="px-4 py-2 text-right font-medium">Output</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
                <th className="px-4 py-2 text-right font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {usage.byAgent.map((row, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="px-4 py-2">{row.agent}</td>
                  <td className="px-4 py-2 text-right text-zinc-400">{formatTokens(row.inputTokens)}</td>
                  <td className="px-4 py-2 text-right text-zinc-400">{formatTokens(row.outputTokens)}</td>
                  <td className="px-4 py-2 text-right text-zinc-300">{formatTokens(row.totalTokens)}</td>
                  <td className="px-4 py-2 text-right text-amber-300">{formatCost(row.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-3 text-xs text-zinc-500">
        Cost is estimated from current model pricing and may differ from your
        actual Anthropic invoice.
      </p>
    </div>
  );
}

function UsageTile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function ProgressPanel({
  progress,
  status,
}: {
  progress?: { completed: number; total: number; stage: string; label: string };
  status: string;
}) {
  const total = progress?.total ?? 0;
  const completed = progress?.completed ?? 0;
  // "completed" counts finished steps; the current one is in flight, so show
  // it as the active step and give the bar a little fill even at step 1.
  const percent =
    total > 0 ? Math.min(100, Math.round(((completed + 0.5) / total) * 100)) : 8;

  const label =
    progress?.label ??
    (status === "queued" ? "Queued — starting soon…" : "Starting analysis…");

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-100">
      <div className="flex items-center gap-3">
        <Loader2 className="animate-spin" size={20} />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">Running AI analysis…</p>
            {total > 0 && (
              <span className="text-xs text-amber-200/80">
                Step {Math.min(completed + 1, total)} of {total}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-amber-200/90">{label}</p>
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/30">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-amber-200/70">
        This page updates automatically — no need to refresh.
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  format,
}: {
  label: string;
  value?: number | null;
  format?: (v: number) => string;
}) {
  const display =
    value == null ? "N/A" : format ? format(value) : String(value);
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-cyan-300">{display}</p>
    </div>
  );
}

function ListSection({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: "check" | "trend" | "alert" | "brain" | "zap";
  tone: string;
}) {
  if (items.length === 0) return null;

  const Icon =
    icon === "check"
      ? CheckCircle2
      : icon === "trend"
      ? TrendingUp
      : icon === "brain"
      ? Brain
      : icon === "zap"
      ? Zap
      : AlertTriangle;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className={`flex items-center gap-2 text-xl font-bold ${tone}`}>
        <Icon size={18} />
        {title}
      </h2>
      <ul className="mt-4 space-y-2 text-zinc-300">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 rounded-lg border border-white/10 bg-black/20 p-3">
            <Icon className={`mt-0.5 shrink-0 ${tone}`} size={16} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionCard({ section }: { section: ReportSection }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold">
          <Brain size={18} className="text-cyan-300" />
          {section.label}
        </h3>
        <span className={`text-2xl font-black ${scoreTone(section.score)}`}>
          {section.score}
        </span>
      </div>

      {section.summary && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">{section.summary}</p>
      )}

      <SectionList title="Strengths" items={section.strengths} icon="check" tone="text-emerald-300" />
      <SectionList title="Weaknesses" items={section.weaknesses} icon="alert" tone="text-amber-300" />
      <SectionList title="Opportunities" items={section.opportunities} icon="trend" tone="text-cyan-300" />
      <SectionList title="Quick Wins" items={section.quickWins} icon="zap" tone="text-blue-300" />
    </div>
  );
}

function SectionList({
  title,
  items,
  icon,
  tone,
}: {
  title: string;
  items: string[];
  icon: "check" | "alert" | "trend" | "zap";
  tone: string;
}) {
  if (!items || items.length === 0) return null;

  const Icon =
    icon === "check"
      ? CheckCircle2
      : icon === "alert"
      ? AlertTriangle
      : icon === "zap"
      ? Zap
      : TrendingUp;

  return (
    <div className="mt-4">
      <h4 className={`flex items-center gap-1.5 text-sm font-semibold ${tone}`}>
        <Icon size={14} />
        {title}
      </h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="rounded-lg border border-white/10 bg-black/20 p-2.5 text-sm text-zinc-300">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
