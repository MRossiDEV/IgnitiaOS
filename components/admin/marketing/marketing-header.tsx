import { Bell, Search, Settings, Sparkles } from "lucide-react";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-cyan-500/20 p-2">
            <Sparkles className="h-6 w-6 text-cyan-400" />
          </div>

          <div>
            <h1 className="text-xl font-bold">Marketing Command Center</h1>
            <p className="text-xs text-zinc-400">Ignitia AI • Marketing Department</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10">
            <Search size={18} />
          </button>

          <button className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10">
            <Bell size={18} />
          </button>

          <button className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10">
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
