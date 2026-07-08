import { SectionCard } from "./AgentsPageUI";
import type { Agent } from "./agent-types";
import { statusStyles } from "./agent-utils";

export function AgentsLogsTab({
  agents,
}: {
  agents: Agent[];
}) {
  return (
    <SectionCard title="Execution Logs">
      <div className="space-y-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-xl border border-white/10 bg-black/20 p-4"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{agent.name}</p>
                <p className="text-xs text-zinc-500">{agent.model}</p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  statusStyles[agent.status] ?? statusStyles.active
                }`}
              >
                {agent.status}
              </span>
            </div>

            <div className="mt-4 text-sm text-zinc-400">
              Agent loaded successfully.

              <br />

              Model:
              <span className="text-white ml-2">{agent.model || "-"}</span>

              <br />

              Temperature:
              <span className="text-white ml-2">{agent.temperature}</span>

              <br />

              Max Tokens:
              <span className="text-white ml-2">{agent.max_tokens}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}