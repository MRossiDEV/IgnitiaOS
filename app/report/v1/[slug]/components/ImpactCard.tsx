interface ImpactCardProps {
  title: string;
  value: string;
}

export function ImpactCard({ title, value }: ImpactCardProps) {
  return (
    <div className="rounded-3xl border border-green-500/20 bg-black/30 p-8">
      <div className="text-sm uppercase tracking-widest text-zinc-500">
        {title}
      </div>

      <div className="mt-5 text-5xl font-black text-green-400">{value}</div>
    </div>
  );
}
