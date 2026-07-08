import React from "react";
import { scoreColor, getScoreCardColor } from "../lib/utils";

interface ProgressRowProps {
  title: string;
  value: number;
}

export function ProgressRow({ title, value }: ProgressRowProps) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <span>{title}</span>

        <span className={scoreColor(value)}>{value}%</span>
      </div>

      <div className="h-3 rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${getScoreCardColor(value)}`}
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}
