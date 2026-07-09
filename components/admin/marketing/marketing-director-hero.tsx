import { Bot, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type MarketingDirectorHeroProps = {
  prompt: string;
  onPromptChange: (value: string) => void;
};

export function MarketingDirectorHero(props: MarketingDirectorHeroProps) {
  const { prompt, onPromptChange } = props;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
    >
      <div className="p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="rounded-2xl bg-cyan-500/20 p-4">
            <Bot className="text-cyan-400" size={34} />
          </div>

          <div>
            <h2 className="text-3xl font-bold">AI Marketing Director</h2>
            <p className="text-zinc-400">Tell your AI marketing team what to do.</p>
          </div>
        </div>

        <textarea
          rows={5}
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder="Example: Create a 30-day Instagram campaign to sell Website Audits to Dentists in Miami. Generate images, captions, hashtags, schedule, and landing page copy."
          className="w-full rounded-2xl border border-white/10 bg-black/30 p-5 outline-none focus:border-cyan-500"
        />

        <div className="mt-5 flex gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold transition hover:bg-cyan-400">
            <Sparkles size={18} />
            Run Marketing Team
          </button>

          <button className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 hover:bg-white/10">
            Templates
          </button>
        </div>
      </div>
    </motion.div>
  );
}
