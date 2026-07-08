"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Star, Wifi, UserCircle2 } from "lucide-react";

type TopBarProps = {
  agentId?: string;
  name?: string | null;
  title?: string | null;
  subtitle?: string | null;
  isOnline?: boolean;
  loading?: boolean;
  onProfileClick?: () => void;
};

type AgentTopBarRecord = {
  name?: string | null;
  title?: string | null;
  category?: string | null;
  status?: string | null;
};

export function TopBar({
  agentId,
  name,
  title,
  subtitle,
  isOnline,
  loading = false,
  onProfileClick,
}: TopBarProps) {
  const [agent, setAgent] = useState<AgentTopBarRecord | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!agentId) {
      setAgent(null);
      return;
    }

    let cancelled = false;

    async function loadAgent() {
      try {
        setFetching(true);
        const res = await fetch(`/api/v1/agents/${agentId}`, { cache: "no-store" });
        const json = await res.json();

        if (!cancelled && res.ok && json?.success && json?.agent) {
          setAgent(json.agent as AgentTopBarRecord);
          console.log("Fetched agent:", json.agent);
        }
      } catch {
        if (!cancelled) {
          setAgent(null);
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
        }
      }
    }

    loadAgent();

    return () => {
      cancelled = true;
    };
  }, [agentId]);

  const effectiveLoading = loading || fetching;

  const resolvedName = name || agent?.name;
  const resolvedTitle = title || agent?.title;
  const resolvedSubtitle = subtitle || agent?.category || "Elite";
  console.log("Resolved title:", resolvedTitle);
  console.log("Resolved name:", agent?.title);

  const resolvedOnline = useMemo(() => {
    if (typeof isOnline === "boolean") {
      return isOnline;
    }

    const status = (agent?.status ?? "").toLowerCase();
    if (!status) {
      return true;
    }

    return status === "active" || status === "online";
  }, [agent?.status, isOnline]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-2 mt-2 flex h-14 items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] px-3 backdrop-blur-2xl"
    >
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{resolvedName} <span className="text-sm text-cyan-400">( {agent?.title} )</span></h1>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/75">
            <div className="flex items-center gap-1 text-[#5BC0FF]">
              <Star size={12} className="fill-[#5BC0FF]" />
              <span>{resolvedSubtitle}</span>
            </div>
            <div className="h-1 w-1 rounded-full bg-white/40" />
            <div className={`flex items-center gap-1 ${resolvedOnline ? "text-green-400" : "text-amber-300"}`}>
              <Wifi size={12} />
              <span>{resolvedOnline ? "Online" : "Idle"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="hidden w-[320px] items-center rounded-lg border border-white/10 bg-[#111827]/70 px-3 py-1.5 lg:flex">
        <Search size={14} className="mr-2 text-[#5BC0FF]" />
        <input
          className="w-full bg-transparent text-xs outline-none placeholder:text-white/45"
          placeholder="Search"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <button className="rounded-lg border border-white/10 bg-white/[0.05] p-2 transition hover:-translate-y-0.5 hover:border-[#5BC0FF66] hover:bg-[#2D6BFF22]">
          <Bell size={16} />
        </button>
        <button
          type="button"
          onClick={onProfileClick}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5 transition hover:-translate-y-0.5 hover:border-[#5BC0FF66]"
        >
          <UserCircle2 size={16} className="text-[#5BC0FF]" />
          <span className="hidden text-xs md:inline">Profile</span>
        </button>
      </div> */}
    </motion.header>
  );
}

export default TopBar;
