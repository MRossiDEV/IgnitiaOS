"use client";

interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-[#05070B]/90 backdrop-blur-xl">

      <div className="mx-auto max-w-md px-6 py-5">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-sm text-zinc-400">
            Paso {current + 1} de {total}
          </span>

          <span className="text-sm font-medium text-blue-400">
            {Math.round(progress)}%
          </span>

        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">

          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>

    </div>
  );
}