import React from "react";

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
}

export function MetricCard({ icon, title, value }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between">
        <div className="text-cyan-400">{icon}</div>

        <div className="text-2xl font-black">{value}</div>
      </div>

      <div className="mt-4 text-sm text-zinc-400">{title}</div>
    </div>
  );
}
