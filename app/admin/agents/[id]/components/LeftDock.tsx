"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  ImageIcon,
  FileText,
  Folder,
  BrainCircuit,
  Rocket,
  Settings,
  Cpu,
} from "lucide-react";

export type AgentWorkspaceView =
  | "overview"
  | "chat"
  | "workspace"
  | "gallery"
  | "reports"
  | "knowledge"
  | "missions"
  | "files"
  | "settings";

const navigation: Array<{
  key: AgentWorkspaceView;
  label: string;
  icon: any;
  badge?: number;
}> = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "chat",
    label: "Chat",
    icon: MessageSquare,
  },
  {
    key: "workspace",
    label: "Workspace",
    icon: FolderKanban,
  },
  {
    key: "gallery",
    label: "Gallery",
    icon: ImageIcon,
  },
  {
    key: "reports",
    label: "Reports",
    icon: FileText,
    badge: 4,
  },
  {
    key: "knowledge",
    label: "Knowledge",
    icon: BrainCircuit,
  },
  {
    key: "missions",
    label: "Missions",
    icon: Rocket,
  },
  {
    key: "files",
    label: "Files",
    icon: Folder,
  },
  // {
  //   key: "settings",
  //   label: "Settings",
  //   icon: Settings,
  // },
];

type LeftDockProps = {
  avatarSrc?: string;
  isOnline?: boolean;
  activeView: AgentWorkspaceView;
  onViewChange: (view: AgentWorkspaceView) => void;
};

export default function LeftDock({
  avatarSrc,
  isOnline = true,
  activeView,
  onViewChange,
}: LeftDockProps) {
  return (
    <aside className="relative z-30 m-2 flex h-[calc(100vh-16px)] w-20 flex-col justify-between rounded-xl border border-white/10 bg-black/30 shadow-[0_0_24px_rgba(45,107,255,0.14)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-72 w-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative">
        <div className="flex justify-center py-4">
          <motion.div whileHover={{ scale: 1.05 }} className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.1, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="absolute inset-0 rounded-full bg-cyan-400 blur-md"
            />

            <img
              src={avatarSrc || "/images/agents/ceo-ai.png"}
              alt="Agent"
              className="relative h-14 w-14 rounded-full border border-cyan-400 object-cover shadow-[0_0_18px_rgba(34,211,238,.5)]"
            />

            <span className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border border-[#070B12] ${isOnline ? "bg-green-400" : "bg-amber-300"}`} />
          </motion.div>
        </div>

        <nav className="space-y-1.5 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.label}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  type="button"
                  onClick={() => onViewChange(item.key)}
                  className={`group relative flex h-10 w-full items-center justify-center rounded-lg border transition-all duration-300 ${
                    activeView === item.key
                      ? "border-cyan-400/40 bg-cyan-500/15"
                      : "border-transparent bg-white/5 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                  }`}
                >
                  <Icon
                    size={16}
                    className={`transition ${
                      activeView === item.key
                        ? "text-cyan-200"
                        : "text-zinc-400 group-hover:text-cyan-300"
                    }`}
                  />

                  <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-lg border border-white/10 bg-black/90 px-2 py-1 text-xs opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    {item.label}
                  </span>

                  {item.badge && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <div className="relative p-2">
        <button
          type="button"
          onClick={() => onViewChange("settings")}
          className={`mb-2 flex h-10 w-full items-center justify-center rounded-lg border transition ${
            activeView === "settings"
              ? "border-cyan-400/40 bg-cyan-500/15"
              : "border-white/10 bg-white/5 hover:border-cyan-400/30 hover:bg-cyan-500/10"
          }`}
        >
          <Settings size={16} className="text-zinc-400" />
        </button>

        <div className="rounded-lg border border-cyan-500/20 bg-black/40 p-2">
          <div className="mb-1.5 flex justify-center">
            <Cpu className="text-cyan-300" size={14} />
          </div>

          <p className="text-center text-[9px] uppercase tracking-wider text-zinc-500">
            Status
          </p>

          <p className={`mb-2 text-center text-xs font-semibold ${isOnline ? "text-green-400" : "text-amber-300"}`}>
            {isOnline ? "ONLINE" : "IDLE"}
          </p>

          <div className="space-y-1.5">
            <div>
              <div className="mb-0.5 flex justify-between text-[9px] text-zinc-500">
                <span>CPU</span>
                <span>38%</span>
              </div>

              <div className="h-1 rounded-full bg-white/10">
                <div className="h-1 w-[38%] rounded-full bg-cyan-400" />
              </div>
            </div>

            <div>
              <div className="mb-0.5 flex justify-between text-[9px] text-zinc-500">
                <span>Memory</span>
                <span>71%</span>
              </div>

              <div className="h-1 rounded-full bg-white/10">
                <div className="h-1 w-[71%] rounded-full bg-cyan-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
