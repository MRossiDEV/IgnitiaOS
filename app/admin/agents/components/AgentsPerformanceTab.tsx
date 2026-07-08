import { Metric, SectionCard } from "./AgentsPageUI";
import type { Agent } from "./agent-types";

export function AgentsPerformanceTab({
  agents,
  totalAgents,
  activeAgents,
  categories,
  models,
}: {
  agents: Agent[];
  totalAgents: number;
  activeAgents: number;
  categories: number;
  models: number;
}) {
  return (
    <SectionCard title="Fleet Performance">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric label="Total Agents" value={totalAgents} />
        <Metric label="Running" value={activeAgents} />
        <Metric label="Categories" value={categories} />
        <Metric label="Models" value={models} />
      </div>

      <div className="mt-8 space-y-5">
        {agents.map((agent) => (
          <div key={agent.id}>
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-medium">{agent.name}</p>
                <p className="text-xs text-zinc-500">{agent.model || "No model configured"}</p>
              </div>

              <span className="text-xs text-zinc-500">{agent.status}</span>
            </div>

            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: agent.status === "active" ? "100%" : "45%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}