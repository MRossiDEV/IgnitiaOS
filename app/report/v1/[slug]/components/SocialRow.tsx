import React from "react";
import { scoreColor, getScoreCardColor } from "../lib/utils";

interface SocialRowProps {
  platform: string;
  score: number;
}

export function SocialRow({ platform, score }: SocialRowProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{platform}</span>

        <span className={scoreColor(score)}>{score}/100</span>
      </div>

      <div className="mt-4 h-2 rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${getScoreCardColor(score)}`}
          style={{
            width: `${score}%`,
          }}
        />
      </div>
    </div>
  );
}
