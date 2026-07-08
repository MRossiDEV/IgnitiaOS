import Link from "next/link";
import { Brain, Calendar, GitBranch, Wrench } from "lucide-react";

import { Metric } from "./AgentsPageUI";
import type { Agent } from "./agent-types";
import { formatDate, statusStyles } from "./agent-utils";

export function AgentsOverviewTab({
  agents,
}: {
  agents: Agent[];
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {agents.map((agent) => (
        <div key={agent.id} className="border border-white/10 bg-white/5 rounded-2xl hover:border-cyan-500/40 transition flex overflow-hidden min-h-[320px]">
          <div className="w-44 shrink-0 bg-black/20">
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt={agent.name}
                className="object-cover h-full w-full"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-cyan-400" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="font-bold text-lg">{agent.name}</h1>
                  <h2 className="font-bold text-cyan-400 text-sm">{agent.title}</h2>

                  <p className="text-xs text-zinc-500">{agent.category || "General"}</p>
                </div>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  statusStyles[agent.status] ?? statusStyles.active
                }`}
              >
                {agent.status}
              </span>
            </div>

            <p className="text-sm text-zinc-400 mt-4 line-clamp-3">
              {agent.description || "No description provided for this agent yet."}
            </p>


            <div className="mt-5 flex gap-2">
              <Link href={`/admin/agents/${agent.id}`} className="flex-1">
                <button className="w-full py-2 rounded-lg bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition">
                  Open
                </button>
              </Link>

              <Link href={`/admin/agents/${agent.id}/edit`} className="flex-1">
                <button className="w-full py-2 rounded-lg border border-white/10 hover:bg-white/5 transition">
                  Edit
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}