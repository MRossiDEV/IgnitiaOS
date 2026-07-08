import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface AuditCardProps {
  title: string;
  good: boolean;
}

export function AuditCard({ title, good }: AuditCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
      <div className="flex items-center gap-3">
        {good ? (
          <CheckCircle2 className="text-green-400" size={22} />
        ) : (
          <XCircle className="text-red-400" size={22} />
        )}

        <span className="font-semibold">{title}</span>
      </div>
    </div>
  );
}
