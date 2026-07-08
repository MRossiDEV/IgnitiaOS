interface InfoLineProps {
  label: string;
  value: any;
}

export function InfoLine({ label, value }: InfoLineProps) {
  return (
    <div className="flex justify-between border-b border-white/5 pb-3">
      <span className="text-zinc-400">{label}</span>

      <span className="font-semibold">{value}</span>
    </div>
  );
}
