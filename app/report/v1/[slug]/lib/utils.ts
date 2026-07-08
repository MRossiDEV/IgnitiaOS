export const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
};

export const scoreBg = (score: number) => {
  if (score >= 80)
    return "from-green-500/20 to-emerald-500/10 border-green-500/20";

  if (score >= 60)
    return "from-yellow-500/20 to-orange-500/10 border-yellow-500/20";

  return "from-red-500/20 to-red-900/10 border-red-500/20";
};

export function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return "0";
  return Number(value).toLocaleString();
}

export const getScoreCardColor = (value: number) => {
  if (value >= 80) return "bg-green-400";
  if (value >= 60) return "bg-yellow-400";
  return "bg-red-400";
};
