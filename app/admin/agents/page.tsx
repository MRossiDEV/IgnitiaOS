"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  Activity,
  Layers,
  Shield,
  Loader2,
} from "lucide-react";
import { KPI } from "./components/AgentsPageUI";
import type { Agent, AgentsTab } from "./components/agent-types";
import { AgentsConfigurationTab } from "./components/AgentsConfigurationTab";
import { AgentsLogsTab } from "./components/AgentsLogsTab";
import { AgentsOverviewTab } from "./components/AgentsOverviewTab";
import { AgentsPageHeader } from "./components/AgentsPageHeader";
import { AgentsPerformanceTab } from "./components/AgentsPerformanceTab";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [tab, setTab] = useState<AgentsTab>("overview");

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      setLoading(true);
      setLoadError(null);

      const response = await fetch("/api/v1/agents", {
        cache: "no-store",
      });

      if (!response.ok) {
        let message = "Failed loading agents";

        try {
          const errorData = await response.json();

          if (typeof errorData?.error === "string") {
            message = errorData.error;
          } else if (typeof errorData?.message === "string") {
            message = errorData.message;
          }
        } catch {
          // Keep default message when body is not JSON.
        }

        throw new Error(message);
      }

      const data = await response.json();

      setAgents(data.agents ?? []);
    } catch (err) {
      console.error(err);
      setLoadError(
        err instanceof Error
          ? err.message
          : "Failed loading agents"
      );
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return agents.filter((a) => {
      const text =
        `${a.name} ${a.description ?? ""} ${a.category ?? ""}`
          .toLowerCase();

      return text.includes(search.toLowerCase());
    });
  }, [agents, search]);

  const totalAgents = agents.length;

  const activeAgents = agents.filter(
    (a) => a.status === "active"
  ).length;

  const categories = new Set(
    agents.map((a) => a.category).filter(Boolean)
  ).size;

  const models = new Set(
    agents.map((a) => a.model).filter(Boolean)
  ).size;

  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white">

      <AgentsPageHeader
        loadError={loadError}
        onRetry={loadAgents}
        search={search}
        onSearchChange={setSearch}
        tab={tab}
        onTabChange={setTab}
      />

      {/* KPI */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <KPI
          title="Agents"
          value={totalAgents}
          icon={<Brain size={16} />}
        />

        <KPI
          title="Active"
          value={activeAgents}
          icon={<Shield size={16} />}
        />

        <KPI
          title="Categories"
          value={categories}
          icon={<Layers size={16} />}
        />

        <KPI
          title="Models"
          value={models}
          icon={<Activity size={16} />}
        />

      </div>

      {/* OVERVIEW */}

      {tab === "overview" && (

        loading ? (

          <div className="h-96 flex items-center justify-center">

            <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />

          </div>

        ) : (

          <AgentsOverviewTab agents={filtered} />

        )

      )}

      {/* PERFORMANCE */}

      {tab === "performance" && (

        <AgentsPerformanceTab
          agents={filtered}
          totalAgents={totalAgents}
          activeAgents={activeAgents}
          categories={categories}
          models={models}
        />

      )}

      {/* CONFIGURATION */}

      {tab === "configuration" && (

        <AgentsConfigurationTab agents={filtered} />

      )}

      {/* LOGS */}

      {tab === "logs" && (

        <AgentsLogsTab agents={filtered} />

      )}

    </div>

  );

}
