import React, { useMemo } from "react";
import {
  Globe,
  Search,
  Star,
  Users,
  Bot,
  Rocket,
  TrendingUp,
} from "lucide-react";
import { Report } from "../../lib/types";
import { scoreColor, getScoreCardColor } from "../../lib/utils";

interface ScoreGridSectionProps {
  report: Report;
}

export function ScoreGridSection({ report }: ScoreGridSectionProps) {
  const scoreCards = useMemo(() => {
    return [
      {
        title: "Website",
        icon: Globe,
        value: `${report.website_score}/100`,
      },
      {
        title: "SEO",
        icon: Search,
        value: `${report.seo_score}/100`,
      },
      {
        title: "Google",
        icon: Star,
        value: `${report.google_score}/100`,
      },
      {
        title: "Social",
        icon: Users,
        value: `${report.social_score}/100`,
      },
      {
        title: "Automation",
        icon: Bot,
        value: `${report.automation_score}/100`,
      },
      {
        title: "Advertising",
        icon: Rocket,
        value: `${report.ads_score}/100`,
      },
      {
        title: "Conversion",
        icon: TrendingUp,
        value: `${report.estimated_conversion_rate}%`,
      },
    ];
  }, [report]);

  return (
    <section className="mx-auto max-w-7xl px-8 py-16">
      <div className="mb-10">
        <h2 className="text-4xl font-black">Digital Growth Score</h2>
        <p className="mt-3 text-zinc-500">
          AI evaluation of the major growth pillars.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {scoreCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/5 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-cyan-500/10 p-3">
                  <Icon className="text-cyan-400" size={22} />
                </div>

                <span
                  className={`text-3xl font-black ${scoreColor(item.value)}`}
                >
                  {item.value}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold">{item.title}</h3>

              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full ${getScoreCardColor(
                    item.value
                  )}`}
                  style={{
                    width: `${item.value}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
