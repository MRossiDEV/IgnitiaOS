import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import {
  type MarketingAgentCard,
  withAlpha,
} from "@/lib/marketing/marketing-page-config";

type MarketingAgentsSectionProps = {
  loadingAgents: boolean;
  agentError: string | null;
  marketingAgents: MarketingAgentCard[];
};

export function MarketingAgentsSection(props: MarketingAgentsSectionProps) {
  const { loadingAgents, agentError, marketingAgents } = props;

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Marketing Agents</h2>

          <p className="text-sm text-zinc-400">
            Your AI marketing department with DB-driven accent colors.
          </p>
        </div>

        <button className="rounded-xl bg-cyan-500 px-5 py-2 font-medium hover:bg-cyan-400">
          Launch All
        </button>
      </div>

      {loadingAgents && (
        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
          Loading marketing agents...
        </div>
      )}

      {agentError && (
        <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          {agentError}. Showing fallback marketing agents.
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {marketingAgents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <div className="h-2" style={{ backgroundColor: agent.accentColor }} />

            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold"
                  style={{
                    backgroundColor: withAlpha(agent.accentColor, "26"),
                    border: `1px solid ${withAlpha(agent.accentColor, "55")}`,
                    color: agent.accentColor,
                  }}
                >
                  {agent.badge}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-1 text-[10px] uppercase tracking-wide"
                    style={{
                      backgroundColor: withAlpha(agent.accentColor, "26"),
                      color: agent.accentColor,
                    }}
                  >
                    {agent.status}
                  </span>
                  <Activity className="text-cyan-400" />
                </div>
              </div>

              <h3 className="text-xl font-bold">{agent.name}</h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{agent.description}</p>

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-black/20 p-4">
                <div>
                  <p className="text-xs text-zinc-500">Active Jobs</p>

                  <p className="text-2xl font-bold">{agent.jobs}</p>
                </div>

                <div className="flex gap-2">
                  <button className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm hover:bg-cyan-500 hover:text-white">
                    Open
                  </button>

                  <button
                    className="rounded-lg px-3 py-2 text-sm font-medium text-black"
                    style={{ backgroundColor: agent.accentColor }}
                  >
                    Run
                  </button>
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/30">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${20 + agent.jobs * 10}%`,
                    backgroundColor: agent.accentColor,
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
