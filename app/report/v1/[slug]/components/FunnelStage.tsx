interface FunnelStageProps {
  title: string;
  value: string | number;
  color: string;
}

export function FunnelStage({ title, value, color }: FunnelStageProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-center">
      <div className={`mx-auto mb-5 h-4 w-20 rounded-full ${color}`} />

      <div className="text-zinc-500">{title}</div>

      <div className="mt-3 text-5xl font-black">{value}</div>
    </div>
  );
}
