type MarketingAiStatusCardProps = {
  activeJobs: number;
};

export function MarketingAiStatusCard(props: MarketingAiStatusCardProps) {
  const { activeJobs } = props;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="mb-4 font-semibold">AI Status</h2>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Marketing Director</span>
          <span className="text-green-400">Online</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">Active Jobs</span>
          <span>{activeJobs}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">Queue</span>
          <span>{Math.max(12, activeJobs + 6)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">AI Credits</span>
          <span className="text-cyan-400">Unlimited</span>
        </div>
      </div>
    </div>
  );
}
