import type { ReactNode } from "react";

export function KPI({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="border border-white/10 bg-white/5 rounded-2xl p-4 hover:border-cyan-500/30 transition">
      <div className="flex justify-between items-center">
        <p className="text-xs text-zinc-500">{title}</p>

        <div className="text-cyan-400">{icon}</div>
      </div>

      <p className="text-2xl font-bold mt-3">{value}</p>
    </div>
  );
}

export function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
        active
          ? "bg-cyan-500 text-black border-cyan-500"
          : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function Metric({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold break-words">{value}</p>
    </div>
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      {children}
    </div>
  );
}