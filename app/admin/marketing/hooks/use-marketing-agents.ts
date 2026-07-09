"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fallbackMarketingAgents,
  toMarketingAgentCard,
  type DbMarketingAgent,
  type MarketingAgentCard,
} from "@/lib/marketing/marketing-page-config";

export function useMarketingAgents() {
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [marketingAgents, setMarketingAgents] = useState<MarketingAgentCard[]>(
    fallbackMarketingAgents
  );

  useEffect(() => {
    let active = true;

    const fetchMarketingAgents = async () => {
      try {
        setLoadingAgents(true);
        setAgentError(null);

        const response = await fetch("/api/v1/agents", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch agents");
        }

        const payload = await response.json();
        const rows = Array.isArray(payload?.agents) ? payload.agents : [];

        const marketingRows = rows.filter((agent: DbMarketingAgent) => {
          const category = String(agent.category || "").toLowerCase();
          return category.includes("marketing");
        });

        const source = marketingRows.length > 0 ? marketingRows : rows;
        const mapped = source
          .slice(0, 12)
          .map((agent: DbMarketingAgent, index: number) =>
            toMarketingAgentCard(agent, index)
          );

        if (active && mapped.length > 0) {
          setMarketingAgents(mapped);
        }
      } catch (error) {
        if (active) {
          setAgentError(
            error instanceof Error
              ? error.message
              : "Unable to load marketing agents"
          );
        }
      } finally {
        if (active) {
          setLoadingAgents(false);
        }
      }
    };

    fetchMarketingAgents();

    return () => {
      active = false;
    };
  }, []);

  const activeJobs = useMemo(
    () => marketingAgents.reduce((sum, item) => sum + item.jobs, 0),
    [marketingAgents]
  );

  return {
    loadingAgents,
    agentError,
    marketingAgents,
    activeJobs,
  };
}
