import { SectionCard } from "./AgentsPageUI";
import type { Agent } from "./agent-types";

export function AgentsConfigurationTab({
  agents,
}: {
  agents: Agent[];
}) {
  return (
    <SectionCard title="Configuration">
      <div className="grid md:grid-cols-2 gap-5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-xl border border-white/10 bg-black/20 p-5"
          >
            <h3 className="font-semibold text-lg">{agent.name}</h3>

            <p className="text-sm text-zinc-500 mt-1">{agent.description}</p>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Model</span>
                <span>{agent.model || "-"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Temperature</span>
                <span>{agent.temperature}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Max Tokens</span>
                <span>{agent.max_tokens}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Category</span>
                <span>{agent.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}