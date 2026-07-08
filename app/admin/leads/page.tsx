"use client";

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Users, DollarSign, Target, Brain, Workflow, TrendingUp,
  Search, Plus, BarChart3, Briefcase
} from "lucide-react";

import { useEffect, useMemo, useState } from "react"

interface Lead {
  id: string
  name: string | null
  company: string | null
  email: string | null
  phone: string | null
  source: string | null
  priority: string | null
  status: string | null
  estimated_value: number | null
  actual_value: number | null
  industry: string | null
  notes: string | null
  created_at: string
}



export default function LeadsPage() {
  const [tab, setTab] = useState("pipeline");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    ["pipeline","Pipeline"],
    ["explorer","Explorer"],
    ["profile","Profile Manager"],
    ["sources","Sources"],
    ["attribution","Attribution"],
    ["ai","AI Center"],
    ["forecast","Forecast"],
    ["automation","Automation"],
    ];

    useEffect(() => {
    loadLeads()
    }, [])
  
  const totalLeads = leads.length

  const qualifiedLeads = leads.filter(
    (lead) => lead.status === "qualified"
  ).length

  const pipelineValue = leads.reduce(
    (sum, lead) => sum + Number(lead.estimated_value || 0),
    0
  )

  const convertedValue = leads.reduce(
    (sum, lead) => sum + Number(lead.actual_value || 0),
    0
  )

  async function loadLeads() {
    try {
      setLoading(true)

      const response = await fetch("/api/leads")

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load leads")
      }

      setLeads(data.leads || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Intelligence Center</h1>
          <p className="text-zinc-500">
            Lead → Opportunity → Client Revenue Engine
          </p>
        </div>

        <Link href="/admin/leads/new" className="bg-cyan-500 text-black px-4 py-2 rounded-xl font-semibold flex items-center gap-2">
          <Plus size={16} />
          New Lead
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KPI
          title="Total Leads"
          value={totalLeads}
          icon={<Users size={18}/>}
        />

        <KPI
          title="Qualified"
          value={qualifiedLeads}
          icon={<Target size={18}/>}
        />

        <KPI
          title="Pipeline"
          value={`$${pipelineValue.toLocaleString()}`}
          icon={<DollarSign size={18}/>}
        />

        <KPI
          title="Revenue"
          value={`$${convertedValue.toLocaleString()}`}
          icon={<TrendingUp size={18}/>}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(([id,label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-xl border text-sm ${
              tab === id
                ? "bg-cyan-500 text-black border-cyan-500"
                : "bg-white/5 border-white/10 text-zinc-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "pipeline" && (<PipelineTab leads={leads}/>)}
      {tab === "explorer" && (<ExplorerTab leads={leads} />)}
      {tab === "profile" && <ProfileTab />}
      {tab === "sources" && <SourcesTab />}
      {tab === "attribution" && <AttributionTab />}
      {tab === "ai" && <AITab />}
      {tab === "forecast" && <ForecastTab />}
      {tab === "automation" && <AutomationTab />}
    </div>
  );
}

function PipelineTab({
  leads,
}: {
  leads: Lead[]
}) {
  const columns = [
    "new",
    "contacted",
    "qualified",
    "won",
  ]

  return (
    <div className="grid lg:grid-cols-4 gap-4">

      {columns.map((status) => {
        const columnLeads = leads.filter(
          (lead) =>
            lead.status?.toLowerCase() === status
        )

        return (
          <div
            key={status}
            className="bg-white/5 border border-white/10 rounded-2xl p-4"
          >
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold capitalize">
                {status}
              </h3>

              <span className="text-xs text-zinc-400">
                {columnLeads.length}
              </span>
            </div>

            {columnLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

function ExplorerTab({
  leads,
}: {
  leads: Lead[]
}) {
  const [search, setSearch] = useState("")

  const filtered = leads.filter((lead) =>
    `${lead.name} ${lead.company}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
        <Search size={16} />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="bg-transparent w-full outline-none"
          placeholder="Search leads..."
        />
      </div>

      {filtered.map((lead) => (
        <div
          key={lead.id}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div className="flex justify-between">

            <div>
              <h3 className="font-semibold">
                {lead.name}
              </h3>

              <p className="text-zinc-500 text-sm">
                {lead.company}
              </p>
            </div>

            <div className="text-cyan-400">
              $
              {Number(
                lead.estimated_value || 0
              ).toLocaleString()}
            </div>

          </div>
        </div>
      ))}
    </div>
  )
}

function ProfileTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Lead Profile</h3>
        <div className="space-y-3">
          <input className="w-full bg-black/30 p-2 rounded" placeholder="Name"/>
          <input className="w-full bg-black/30 p-2 rounded" placeholder="Company"/>
          <input className="w-full bg-black/30 p-2 rounded" placeholder="Email"/>
          <input className="w-full bg-black/30 p-2 rounded" placeholder="Phone"/>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Timeline & Notes</h3>
        <div className="space-y-3">
          <TimelineItem text="Lead Created"/>
          <TimelineItem text="AI Audit Generated"/>
          <TimelineItem text="Follow Up Scheduled"/>
        </div>
      </div>
    </div>
  );
}

function SourcesTab() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {["Google Ads","SEO","Referral","Marketplace"].map(x=>(
        <Card key={x} title={x} value="143 Leads"/>
      ))}
    </div>
  );
}

function AttributionTab() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <h3 className="font-semibold mb-4">Campaign Attribution</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-400">
            <th className="text-left">Campaign</th>
            <th>Leads</th>
            <th>Revenue</th>
            <th>ROI</th>
          </tr>
        </thead>
      </table>
    </div>
  );
}

function AITab() {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card title="Lead Scoring" value="Analyze 500 Leads"/>
      <Card title="Intent Detection" value="82% Buy Intent"/>
      <Card title="Enrichment" value="Company Data"/>
    </div>
  );
}

function ForecastTab() {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <Card title="Pipeline Value" value="$245,000"/>
      <Card title="Expected Revenue" value="$84,000"/>
      <Card title="Close Rate" value="34%"/>
    </div>
  );
}

function AutomationTab() {
  return (
    <div className="space-y-4">
      {[
        "If Score > 80 → Hot Lead",
        "If Construction → Assign Agent",
        "If No Contact 3 Days → Reminder",
        "If Qualified → Create Opportunity"
      ].map(rule=>(
        <div key={rule} className="bg-white/5 border border-white/10 rounded-xl p-4">
          {rule}
        </div>
      ))}
    </div>
  );
}

function KPI({title,value,icon}:any){
  return(
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex justify-between">
        <p className="text-xs text-zinc-500">{title}</p>
        {icon}
      </div>
      <p className="text-xl font-bold mt-2">{value}</p>
    </div>
  )
}

function Card({title,value}:any){
  return(
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <p className="text-zinc-500 text-sm">{title}</p>
      <p className="text-xl font-bold mt-2">{value}</p>
    </div>
  )
}

function LeadCard({
  lead,
}: {
  lead: Lead
}) {
  const router = useRouter()

  return (
    <div
      onClick={() =>
        router.push(`/admin/leads/${lead.id}/edit`)
      }
      className="
        group
        bg-black/30
        border border-white/10
        rounded-xl
        p-4
        mb-3
        cursor-pointer
        transition-all
        duration-200
        hover:border-cyan-500/50
        hover:bg-cyan-500/5
        hover:shadow-lg
        hover:shadow-cyan-500/10
      "
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold group-hover:text-cyan-400 transition-colors">
            {lead.name || "Unnamed Lead"}
          </p>

          <p className="text-xs text-zinc-500">
            {lead.company ||
              lead.industry ||
              "No Company"}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">
              {lead.status || "new"}
            </span>

            {lead.priority && (
              <span className="text-[10px] px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {lead.priority}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-cyan-400 font-semibold">
            $
            {Number(
              lead.estimated_value || 0
            ).toLocaleString()}
          </span>

          <p className="text-[10px] text-zinc-500 mt-1">
            View →
          </p>
        </div>
      </div>
    </div>
  )
}

function TimelineItem({text}:any){
  return(
    <div className="border-l border-cyan-500 pl-4 py-2">
      {text}
    </div>
  )
}
