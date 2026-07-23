"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  Brain,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

type AgentTier = "basic" | "pro" | "full";
type Agent = {
  // Registry task id sent to the API (e.g. "analyst.seo").
  id: string;
  name: string;
  description: string;
  tier: AgentTier;
  cost: number;
};

// Mirrors SPECIALIST_CATALOG in lib/ai/pipeline/custom-report.ts.
// The server re-validates these ids before running anything.
const AGENTS: Agent[] = [
  { id: "analyst.seo", name: "SEO", description: "Titles, meta, headings, schema, links.", tier: "basic", cost: 1 },
  { id: "analyst.ux", name: "User Experience", description: "Usability, navigation, layout.", tier: "basic", cost: 1 },
  { id: "analyst.content", name: "Content", description: "Content depth, clarity, messaging.", tier: "basic", cost: 1 },
  { id: "analyst.branding", name: "Branding", description: "Positioning and visual identity cues.", tier: "basic", cost: 1 },
  { id: "analyst.copywriting", name: "Copywriting", description: "Headlines, value prop, persuasion.", tier: "basic", cost: 1 },
  { id: "analyst.conversion", name: "Conversion", description: "CTAs, funnels, conversion friction.", tier: "pro", cost: 3 },
  { id: "analyst.trust", name: "Trust", description: "Proof, guarantees, contact, security.", tier: "pro", cost: 3 },
  { id: "analyst.accessibility", name: "Accessibility", description: "Assistive-technology accessibility.", tier: "pro", cost: 3 },
  { id: "analyst.social", name: "Social Media", description: "Public social presence from the site.", tier: "pro", cost: 3 },
  { id: "analyst.google", name: "Google Business", description: "Google Business Profile completeness.", tier: "pro", cost: 3 },
  { id: "analyst.reputation", name: "Reputation", description: "Review rating and volume signals.", tier: "full", cost: 5 },
  { id: "analyst.competitors", name: "Competitors", description: "Comparison vs competitor websites.", tier: "full", cost: 5 },
];

export default function NewReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({    
    status: "draft",
    version: "1",
    business_name: "",
    business_website: "",
    industry: "",
    business_size: "",
    business_email: "",
    business_phone: "",
    country: "United States",
    state: "",
    city: "",
    address: "",
    audit_date: "",
    expires_at: "",
    google_business_url: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    tags: "",
    notes: "",
  });

  const [selectedAgents, setSelectedAgents] = useState<string[]>([
    "analyst.seo",
    "analyst.ux",
    "analyst.content",
  ]);

  const groupedAgents = {
    basic: AGENTS.filter((a) => a.tier === "basic"),
    pro: AGENTS.filter((a) => a.tier === "pro"),
    full: AGENTS.filter((a) => a.tier === "full"),
  };

  async function generateReport() {
    try {
      setLoading(true);

      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const res = await fetch("/api/v1/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          tags,
          agents: selectedAgents,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      const reportPathSegment = data.slug || data.report_slug || data.id;
      router.push(`/admin/reports/${reportPathSegment}`);
    } catch (err) {
      console.error(err);
      alert("Failed generating report.");
    } finally {
      setLoading(false);
    }
  }

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function toggleAgent(agentId: string) {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((a) => a !== agentId)
        : [...prev, agentId]
    );
  }

  function renderAgent(agent: Agent) {
    const isSelected = selectedAgents.includes(agent.id);

    const tierColor =
      agent.tier === "basic"
        ? "border-emerald-500/30"
        : agent.tier === "pro"
        ? "border-blue-500/30"
        : "border-red-500/30";

    return (
      <button
        key={agent.id}
        type="button"
        onClick={() => toggleAgent(agent.id)}
        className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-left transition ${tierColor} ${
          isSelected
            ? "bg-cyan-500/10"
            : "bg-black/20 opacity-80 hover:bg-white/5"
        }`}
      >
        <div className="flex items-start gap-2">
          {isSelected ? (
            <CheckCircle2 className="mt-0.5 shrink-0 text-cyan-400" size={18} />
          ) : (
            <AlertCircle className="mt-0.5 shrink-0 text-zinc-500" size={18} />
          )}
          <span>
            <span className="block font-medium">{agent.name}</span>
            <span className="mt-0.5 block text-xs text-zinc-400">{agent.description}</span>
          </span>
        </div>

        <span className="shrink-0 text-xs text-zinc-400">${agent.cost}</span>
      </button>
    );
  }

  const inputClass =
    "rounded-xl border border-white/10 bg-black/20 p-4 text-sm outline-none transition placeholder:text-zinc-500 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/40";
  const panelClass = "rounded-2xl border border-white/10 bg-white/5 p-6";

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
            <h1 className="text-3xl font-bold">New Report</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Create an AI-powered business audit and strategy report.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-cyan-500/20 p-3">
            <Brain className="text-cyan-300" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black">AI Business Audit Generator</h2>
            <p className="mt-2 max-w-4xl text-sm text-zinc-300">
              Generate website, SEO, social, brand, conversion, and growth insights in a single report.
            </p>
          </div>
        </div>
      </div>

      <div className={panelClass}>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Building2 size={20} />
          Report + Business Information
        </h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">

          <div>
            <label htmlFor="status" className="text-sm text-zinc-400 px-2">
              Status
            </label>
            <select
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="collecting">Collecting</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="version" className="text-sm text-zinc-400">
              Version
            </label>
            <input           
              value={form.version}
              onChange={(e) => update("version", e.target.value)}
              placeholder="Version"
              className={inputClass}
            />

            </div>




          <input
            value={form.business_name}
            onChange={(e) => update("business_name", e.target.value)}
            placeholder="Business Name"
            className={inputClass}
          />

          <input
            value={form.business_website}
            onChange={(e) => update("business_website", e.target.value)}
            placeholder="Website"
            className={inputClass}
          />

          <div>
            <label htmlFor="industry" className="text-sm text-zinc-400 px-2">
              Industry
            </label>
            <select
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
            className={inputClass}
          >
              <option value="technology">Technology</option>
              <option value="realstate">Realstate</option>
            <option value="finance">Finance</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
              <option value="retail">Retail</option>
            <option value="hospitality">Hospitality</option>
            <option value="manufacturing">Manufacturing</option>
              <option value="transportation">Transportation</option>
              <option value="energy">Energy</option>
            <option value="entertainment">Entertainment</option>
            <option value="other">Other</option>
              </select>
          </div>

          <div>
            <label htmlFor="business_size" className="text-sm text-zinc-400 px-2">
              Business Size
            </label>
            <select
            value={form.business_size}
            onChange={(e) => update("business_size", e.target.value)}
            className={inputClass}
          >
            <option value="0-5">0-5</option>
            <option value="6-10">6-10</option>
            <option value="11-50">11-50</option>
            <option value="51-200">51-200</option>
            <option value="201-500">201-500</option>
            <option value="500+">500+</option>
          </select>

          </div>



          <input
            value={form.business_email}
            onChange={(e) => update("business_email", e.target.value)}
            placeholder="Business Email"
            className={inputClass}
          />

          <input
            value={form.business_phone}
            onChange={(e) => update("business_phone", e.target.value)}
            placeholder="Phone"
            className={inputClass}
          />

          <div>
            <label htmlFor="audit_date" className="text-sm text-zinc-400 px-2">
              Audit Date
            </label>
            <input
            type="date"
            value={form.audit_date}
            onChange={(e) => update("audit_date", e.target.value)}
            placeholder="Audit Date"
            className={inputClass}
          />


          </div>

          <div>
            <label htmlFor="expires_at" className="text-sm text-zinc-400 px-2">
              Expires At
            </label>            
            <input
              type="date"
              value={form.expires_at}
              onChange={(e) => update("expires_at", e.target.value)}
              placeholder="Expires At"
              className={inputClass}
              />
          </div>

        </div>
      </div>

      <div className={panelClass}>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <MapPin size={20} />
          Business Location
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <div>
            <label htmlFor="country" className="text-sm text-zinc-400 px-2">
              Country
            </label>
            <select
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className={inputClass}
          >
            <option value="US">United States</option>
            <option value="UY">Uruguay</option>
            <option value="AR">Argentina</option>
            <option value="MX">Mexico</option>
            <option value="ES">Spain</option>
            
          </select>

          </div>
  

          <input
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            placeholder="State"
            className={inputClass}
          />

          <input
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="City"
            className={inputClass}
          />

          <input
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="Address"
            className={inputClass}
          />

        </div>
      </div>

      <div className={panelClass}>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Globe size={20} />
          Online Presence
        </h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">

          <input
            value={form.google_business_url}
            onChange={(e) => update("google_business_url", e.target.value)}
            placeholder="Google Business URL"
            className={inputClass}
          />

          <input
            value={form.facebook}
            onChange={(e) => update("facebook", e.target.value)}
            placeholder="Facebook"
            className={inputClass}
          />

          <input
            value={form.instagram}
            onChange={(e) => update("instagram", e.target.value)}
            placeholder="Instagram"
            className={inputClass}
          />

          <input
            value={form.linkedin}
            onChange={(e) => update("linkedin", e.target.value)}
            placeholder="LinkedIn"
            className={inputClass}
          />

          <input
            value={form.youtube}
            onChange={(e) => update("youtube", e.target.value)}
            placeholder="YouTube"
            className={inputClass}
          />

          <input
            value={form.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="Tags (comma separated)"
            className={inputClass}
          />

        </div>
      </div>

      <div className={panelClass}>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Briefcase size={20} />
          Notes
        </h2>

        <textarea
          rows={6}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Extra information about this company..."
          className="mt-6 w-full rounded-xl border border-white/10 bg-black/20 p-4 text-sm outline-none transition placeholder:text-zinc-500 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/40"
        />
      </div>

      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Specialists that will run</h2>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
            {selectedAgents.length} selected
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Pick which AI specialists analyze this business. Data collection
          (website crawl, Google Business, social) runs automatically for the
          specialists you choose, and the Report Builder always assembles the
          final report.
        </p>

        <div className="mt-6 flex flex-col gap-6">

          <h3 className="mt-2 text-sm font-bold text-emerald-300">Basic (Low cost / fast data)</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {groupedAgents.basic.map((agent) => renderAgent(agent))}
          </div>

          <h3 className="mt-2 text-sm font-bold text-blue-300">Pro (Deep analysis)</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {groupedAgents.pro.map((agent) => renderAgent(agent))}
          </div>

          <h3 className="mt-2 text-sm font-bold text-red-300">Full (Expensive AI reasoning)</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {groupedAgents.full.map((agent) => renderAgent(agent))}
          </div>

        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Link
          href="/admin/reports"
          className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm transition hover:bg-white/10"
        >
          Cancel
        </Link>

        <button
          onClick={generateReport}
          disabled={loading || selectedAgents.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Generating Report...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate AI Report
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}