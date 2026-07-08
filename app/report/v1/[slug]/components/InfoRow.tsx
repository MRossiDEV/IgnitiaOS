import React from "react";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: any;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
        {icon}
      </div>

      <div>
        <div className="text-xs uppercase tracking-widest text-zinc-500">
          {label}
        </div>

        <div className="font-semibold">{value || "-"}</div>
      </div>
    </div>
  );
}
