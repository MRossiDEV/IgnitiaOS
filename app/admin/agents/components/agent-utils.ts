export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export const statusStyles: Record<string, string> = {
  active:
    "bg-green-500/10 text-green-400 border-green-500/20",
  inactive:
    "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  training:
    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  error:
    "bg-red-500/10 text-red-400 border-red-500/20",
};