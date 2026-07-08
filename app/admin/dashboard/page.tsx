"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  DollarSign,
  Zap,
  Target,
  Rocket,
  Brain,
  AlertCircle,
  Activity,
  Layers,
  BriefcaseIcon,
} from "lucide-react";

/**
 * IGNITIAOS — COMMAND CENTER DASHBOARD (STYLE UPGRADED)
 * Based on Landing Pages / Opportunities UI system
 */

type Metrics = {
  totalRevenue: number;
  revenueToday: number;
  activeClients: number;
  totalClients: number;
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  activeCampaigns: number;
  aiTasksRunning: number;
  aiTasksQueued: number;
  alerts: any[];
};

const EMPTY: Metrics = {
  totalRevenue: 0,
  revenueToday: 0,
  activeClients: 0,
  totalClients: 0,
  totalLeads: 0,
  qualifiedLeads: 0,
  conversionRate: 0,
  activeCampaigns: 0,
  aiTasksRunning: 0,
  aiTasksQueued: 0,
  alerts: [],
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>(EMPTY);
  const [agentAvatar, setAgentAvatar] = useState<string>("");  
  const [agentName, setAgentName] = useState<string>("Unknown Agent");
  const [agentTitle, setAgentTitle] = useState<string>("Unknown Agent");

  const agentID = "197f3a45-3aac-40ca-91aa-245f48af2be8";

  useEffect(() => {
    // fetchMetrics();
    const i = setInterval(() => {
      // fetchMetrics();
    }, 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (agentID) {
      fetchAgentAvatar();
    }
  }, [agentID]);

  // const fetchMetrics = async () => {
  //   try {
  //     const res = await fetch("/api/admin/ignitiaos/metrics");
  //     if (res.ok) {
  //       const data = await res.json();
  //       setMetrics({ ...EMPTY, ...data });
  //     }
  //   } catch {}
  // };

  const fetchAgentAvatar = async () => {
    try {
      const res = await fetch(`/api/v1/agents/${agentID}`);
      if (res.ok) {
        const data = await res.json();
        setAgentAvatar(data.agent.avatar || "");
        setAgentName(data.agent.name || "Unknown Agent");
        setAgentTitle(data.agent.title || "Unknown Agent");
        
      }
    } catch {}
  };

  const revenueScore =
    metrics.totalRevenue + metrics.revenueToday * 10;

  const leadScore =
    metrics.totalLeads > 0
      ? (metrics.qualifiedLeads / metrics.totalLeads) * 100
      : 0;

  function action(label: string) {
    console.log(label);
  }

  return (
    <>
    <div className="relative h-[100px] w-full flex flex-row overflow-hidden bg-[rgb(5,5,5)] text-white"> 
      <img className="w-auto h-[150px] mr-4 rounded-sm" src={agentAvatar} alt="Agent Avatar" />     
      <div className="text-white font-bold" >
        <h1 className="text-3xl font-bold">{agentName}</h1>
        {agentName && (          
          <h1 className="text-md text-cyan-500"> {agentTitle}</h1>
          
        )}
      </div>
             
    </div>

    <div className="p-6 space-y-6 text-white">
      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-3xl font-bold">Command Center</h1>
          <p className="text-zinc-500 text-sm">
            Real-time revenue generation & AI execution system
          </p>
        </div>

        <button className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded-xl font-semibold">
          <Zap size={16} />
          Run System Scan
        </button>

      </div>

      {/* ALERT */}
      {metrics.alerts.length > 0 && (
        <div className="border border-red-500/20 bg-red-500/10 text-red-300 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} />
          <span className="text-sm">
            {metrics.alerts.length} system alerts require attention
          </span>
        </div>
      )}

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <KPI
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign size={16} />}
        />

        <KPI
          title="Active Clients"
          value={`${metrics.activeClients}/${metrics.totalClients}`}
          icon={<Users size={16} />}
        />

        <KPI
          title="Leads Conversion"
          value={`${leadScore.toFixed(1)}%`}
          icon={<Target size={16} />}
        />

        <KPI
          title="AI Execution"
          value={`${metrics.aiTasksRunning}/${metrics.aiTasksQueued}`}
          icon={<Brain size={16} />}
        />

      </div>

      {/* CORE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* REVENUE ENGINE */}
        <Card title="Revenue Engine" icon={<TrendingUp size={16} />}>
          <div className="space-y-3">

            <MiniStat label="Total Revenue Score" value={`$${revenueScore.toLocaleString()}`} />
            <MiniStat label="Today Revenue" value={`$${metrics.revenueToday}`} />
            <MiniStat label="Active Campaigns" value={metrics.activeCampaigns} />

            <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-3">
              <p className="text-xs text-zinc-500">Revenue Flow Strength</p>
              <div className="w-full h-2 bg-white/10 rounded mt-2">
                <div
                  className="h-2 bg-green-500 rounded"
                  style={{
                    width: `${Math.min(100, revenueScore / 100)}%`,
                  }}
                />
              </div>
            </div>

          </div>
        </Card>

        {/* LEAD ENGINE */}
        <Card title="Lead Engine" icon={<Target size={16} />}>
          <div className="space-y-3">

            <MiniStat label="Total Leads" value={metrics.totalLeads} />
            <MiniStat label="Qualified Leads" value={metrics.qualifiedLeads} />
            <MiniStat label="Conversion Rate" value={`${leadScore.toFixed(1)}%`} />

            <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-3">
              <p className="text-xs text-zinc-500">Lead Quality Index</p>
              <div className="w-full h-2 bg-white/10 rounded mt-2">
                <div
                  className="h-2 bg-cyan-500 rounded"
                  style={{ width: `${leadScore}%` }}
                />
              </div>
            </div>

          </div>
        </Card>

        {/* AI EXECUTION */}
        <Card title="AI Execution Layer" icon={<Brain size={16} />}>
          <div className="space-y-3">

            <MiniStat label="Running Tasks" value={metrics.aiTasksRunning} />
            <MiniStat label="Queued Tasks" value={metrics.aiTasksQueued} />
            <MiniStat
              label="System Load"
              value={`${((metrics.aiTasksRunning / (metrics.aiTasksQueued || 1)) * 100).toFixed(0)}%`}
            />

            <button
              onClick={() => action("trigger-ai")}
              className="w-full mt-4 bg-cyan-500 text-black py-2 rounded-xl font-semibold"
            >
              Trigger AI Optimization
            </button>

          </div>
        </Card>

        {/* SYSTEM STATUS */}
        <Card title="System Status" icon={<Activity size={16} />}>
          <div className="space-y-3">

            <MiniStat label="Uptime Stability" value="99.2%" />
            <MiniStat label="Active Modules" value="6/6" />
            <MiniStat label="Processing Health" value="Optimal" />

            <div className="mt-4 bg-black/30 border border-white/10 rounded-xl p-3">
              <p className="text-xs text-zinc-500">System Health</p>
              <div className="w-full h-2 bg-white/10 rounded mt-2">
                <div className="h-2 bg-green-500 rounded w-[92%]" />
              </div>
            </div>

          </div>
        </Card>

      </div>
    </div>
    </>
    
  );
}

/* ================= UI COMPONENTS ================= */

function KPI({ title, value, icon }: any) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-2xl p-4 hover:border-white/20 transition">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{title}</p>
        <div className="text-cyan-400">{icon}</div>
      </div>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Card({ title, icon, children }: any) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-2xl p-5 hover:border-white/20 transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: any) {
  return (
    <div className="flex justify-between text-sm border-b border-white/10 pb-2">
      <span className="text-zinc-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}