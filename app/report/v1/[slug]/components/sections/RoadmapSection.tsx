import React from "react";
import { Gauge, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Report } from "../../lib/types";

interface RoadmapSectionProps {
  report: Report;
}

export function RoadmapSection({ report }: RoadmapSectionProps) {
  const roadmapPhases = React.useMemo(() => {
    if (Array.isArray(report.roadmap?.phases)) {
      return report.roadmap.phases.map((phase: any, index: number) => ({
        title: phase.title || `Phase ${index + 1}`,
        tasks: phase.tasks || [],
      }));
    }

    const entries = Object.entries(report.roadmap || {})
      .filter(([_, value]) => Array.isArray(value))
      .map(([key, value], index) => ({
        title: key.replace(/_/g, " ").replace(/phase/i, "Phase").trim() || `Phase ${index + 1}`,
        tasks: Array.isArray(value) ? value : [],
      }));

    return entries.length ? entries : [];
  }, [report.roadmap]);

  return (
    <section className="mx-auto max-w-7xl px-8 py-12">
      <div className="rounded-[36px] border border-cyan-500/20 bg-cyan-500/5 p-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-black">
              Recommended 90-Day Growth Plan
            </h2>

            <p className="mt-3 text-zinc-400">
              The roadmap our team would execute for your company.
            </p>
          </div>

          <Gauge className="text-cyan-400" size={42} />
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {roadmapPhases.map((phase: any, index: number) => (
            <div
              key={`${phase.title}-${index}`}
              className="rounded-3xl border border-white/10 bg-black/30 p-8"
            >
              <div className="flex items-center justify-between">
                <div className="text-5xl font-black text-cyan-400">
                  {index + 1}
                </div>

                <ArrowUpRight className="text-cyan-400" size={24} />
              </div>

              <h3 className="mt-8 text-2xl font-bold">{phase.title}</h3>

              <div className="mt-6 space-y-4">
                {(phase.tasks || []).map((task: string) => (
                  <div key={task} className="flex gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-1 text-green-400"
                    />

                    <span className="text-zinc-300">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
