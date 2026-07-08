"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Globe,
  Search,
  Building2,
  Users,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
  DollarSign,
} from "lucide-react";

export default function SnapshotPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const [report, setReport] = useState<any>(null);
  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(`/api/reports/${params.id}`);

    const json = await res.json();

    setReport(json.report);
    setSnapshot(json.snapshot);
  }

  if (!snapshot)
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading...
      </div>
    );

  const scores = [
    {
      title: "Website",
      value: snapshot.website_score,
      icon: Globe,
    },
    {
      title: "SEO",
      value: snapshot.seo_score,
      icon: Search,
    },
    {
      title: "Google",
      value: snapshot.google_score,
      icon: Building2,
    },
    {
      title: "Social",
      value: snapshot.social_score,
      icon: Users,
    },
    {
      title: "Brand",
      value: snapshot.branding_score,
      icon: Sparkles,
    },
    {
      title: "AI",
      value: snapshot.ai_score,
      icon: Brain,
    },
  ];

  return (
    <main className="min-h-screen bg-[#070B12] text-white">

      <section className="border-b border-white/10 bg-gradient-to-b from-cyan-500/10 to-transparent">

        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="inline-flex rounded-full bg-cyan-500/10 px-5 py-2 text-sm text-cyan-400">
            AI Growth Snapshot
          </div>

          <h1 className="mt-6 text-6xl font-black">

            {report.business_name}

          </h1>

          <p className="mt-4 max-w-3xl text-xl text-zinc-400">

            {snapshot.executive_summary}

          </p>

          <div className="mt-10 flex items-end gap-5">

            <div className="text-8xl font-black text-cyan-400">

              {snapshot.overall_score}

            </div>

            <div className="pb-4 text-zinc-400">

              Overall Growth Score

            </div>

          </div>

        </div>

      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-6">

          {scores.map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <Icon
                  className="text-cyan-400"
                  size={28}
                />

                <div className="mt-6 text-5xl font-black">

                  {item.value}

                </div>

                <div className="mt-2 text-zinc-400">

                  {item.title}

                </div>

              </div>
            );
          })}

        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

            <h2 className="flex items-center gap-3 text-2xl font-bold">

              <CheckCircle2 className="text-green-400" />

              Quick Wins

            </h2>

            <div className="mt-6 space-y-4">

              {snapshot.quick_wins.map((item: string) => (
                <div
                  key={item}
                  className="rounded-xl bg-black/30 p-4"
                >
                  {item}
                </div>
              ))}

            </div>

          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

            <h2 className="flex items-center gap-3 text-2xl font-bold">

              <AlertTriangle className="text-yellow-400" />

              Biggest Opportunities

            </h2>

            <div className="mt-6 space-y-4">

              {snapshot.opportunities.map((item: string) => (
                <div
                  key={item}
                  className="rounded-xl bg-black/30 p-4"
                >
                  {item}
                </div>
              ))}

            </div>

          </div>

        </div>

        <div className="mt-10 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-10">

          <div className="flex items-center gap-4">

            <DollarSign
              className="text-emerald-400"
              size={40}
            />

            <div>

              <h2 className="text-3xl font-black">

                Estimated Revenue Opportunity

              </h2>

              <div className="mt-2 text-zinc-400">

                Based on your current online presence

              </div>

            </div>

          </div>

          <div className="mt-10 text-6xl font-black text-emerald-400">

            $
            {Number(
              snapshot.estimated_lost_revenue
            ).toLocaleString()}

            <span className="ml-3 text-2xl">

              / month

            </span>

          </div>

        </div>

        {/* PREMIUM */}

        <div className="relative mt-16 overflow-hidden rounded-[40px] border border-cyan-500/30">

          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <div className="relative p-16">

            <div className="flex items-center gap-4">

              <Lock
                className="text-cyan-400"
                size={40}
              />

              <div>

                <h2 className="text-4xl font-black">

                  Full AI Growth Blueprint

                </h2>

                <p className="mt-2 text-zinc-400">

                  Unlock the complete strategy created specifically for this business.

                </p>

              </div>

            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {[
                "Competitor Analysis",
                "Keyword Research",
                "SEO Strategy",
                "Marketing Strategy",
                "Sales Funnel",
                "Automation Plan",
                "AI Implementation",
                "90-Day Roadmap",
                "Revenue Forecast",
                "Custom Proposal",
                "Executive PDF",
                "Presentation Deck",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <Lock
                    className="mb-5 text-cyan-400"
                    size={26}
                  />

                  <h3 className="text-lg font-bold">

                    {item}

                  </h3>

                </div>
              ))}

            </div>

            <button className="mt-12 rounded-2xl bg-cyan-500 px-12 py-5 text-xl font-bold text-black">

              Generate Premium Blueprint

            </button>

          </div>

        </div>

      </section>

    </main>
  );
}