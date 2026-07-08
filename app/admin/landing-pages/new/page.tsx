"use client";

import { useState } from "react";
import {
  Plus,
  Eye,
  Save,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  BarChart3,
  Settings,
  Search,
  Globe,
  Layers,
  Trash2,
  ChevronDown,
} from "lucide-react";

type TabType =
  | "builder"
  | "flow"
  | "analytics"
  | "seo"
  | "settings";

type SectionType =
  | "hero"
  | "benefits"
  | "features"
  | "testimonials"
  | "pricing"
  | "faq"
  | "cta";

type Section = {
  id: string;
  type: SectionType;
  title: string;
  headline: string;
  content: string;
};

const starterSections: Section[] = [
  {
    id: "1",
    type: "hero",
    title: "Hero",
    headline: "Grow Your Business Faster",
    content: "Generate qualified leads every day.",
  },
  {
    id: "2",
    type: "benefits",
    title: "Benefits",
    headline: "Why Choose Us",
    content: "More leads, better ROI, automated growth.",
  },
  {
    id: "3",
    type: "testimonials",
    title: "Testimonials",
    headline: "Trusted By Businesses",
    content: "★★★★★ Excellent results and amazing support.",
  },
  {
    id: "4",
    type: "cta",
    title: "Call To Action",
    headline: "Ready To Scale?",
    content: "Book your strategy call today.",
  },
];

export default function LandingPageBuilder() {
  const [activeTab, setActiveTab] = useState<TabType>("builder");
  const [sections, setSections] = useState(starterSections);
  const [selectedSection, setSelectedSection] =
    useState<Section>(starterSections[0]);

  const addSection = (type: SectionType) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      title: type,
      headline: `New ${type}`,
      content: "Section content...",
    };

    setSections([...sections, newSection]);
  };

  const updateSection = (
    field: "headline" | "content",
    value: string
  ) => {
    const updated = sections.map((s) =>
      s.id === selectedSection.id
        ? {
            ...s,
            [field]: value,
          }
        : s
    );

    setSections(updated);

    setSelectedSection({
      ...selectedSection,
      [field]: value,
    });
  };

  const deleteSection = (id: string) => {
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);

    if (updated.length > 0) {
      setSelectedSection(updated[0]);
    }
  };

  return (
    <div className="h-screen bg-[#0B0F19] text-white flex flex-col">

      {/* HEADER */}

      <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between">

        <div>
          <h1 className="font-bold text-xl">
            Landing Page Builder
          </h1>
          <p className="text-xs text-zinc-500">
            AI Funnel & Landing Builder
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button className="p-2 bg-white/5 rounded-lg">
            <Monitor size={16} />
          </button>

          <button className="p-2 bg-white/5 rounded-lg">
            <Tablet size={16} />
          </button>

          <button className="p-2 bg-white/5 rounded-lg">
            <Smartphone size={16} />
          </button>

          <button className="px-3 py-2 bg-white/5 rounded-xl flex items-center gap-2 text-sm">
            <Eye size={15} />
            Preview
          </button>

          <button className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-xl flex items-center gap-2 text-sm">
            <Sparkles size={15} />
            AI Optimize
          </button>

          <button className="px-4 py-2 bg-cyan-500 text-black rounded-xl font-semibold flex items-center gap-2">
            <Save size={15} />
            Save
          </button>

        </div>

      </div>

      {/* TABS */}

      <div className="h-14 border-b border-white/10 px-6 flex items-center gap-3">

        {[
          ["builder", Layers],
          ["flow", Layers],
          ["analytics", BarChart3],
          ["seo", Globe],
          ["settings", Settings],
        ].map(([tab, Icon]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 capitalize transition ${
              activeTab === tab
                ? "bg-cyan-500 text-black"
                : "bg-white/5"
            }`}
          >
            <Icon size={15} />
            {tab}
          </button>
        ))}

      </div>

      {/* MAIN */}

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}

        <div className="w-[300px] border-r border-white/10 p-4 overflow-y-auto">

          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">
              Page Structure
            </h3>

            <div className="space-y-2">

              {sections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => setSelectedSection(section)}
                  className={`p-3 rounded-xl cursor-pointer border transition ${
                    selectedSection.id === section.id
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex justify-between">

                    <div>
                      <p className="text-sm font-medium">
                        {section.title}
                      </p>

                      <p className="text-xs text-zinc-500">
                        {section.type}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>

                  </div>
                </div>
              ))}

            </div>
          </div>

          <div>

            <h3 className="text-sm font-semibold mb-3">
              Add Section
            </h3>

            <div className="space-y-2">

              {[
                "hero",
                "benefits",
                "features",
                "testimonials",
                "pricing",
                "faq",
                "cta",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    addSection(type as SectionType)
                  }
                  className="w-full bg-white/5 hover:bg-white/10 p-2 rounded-lg text-left text-sm"
                >
                  + {type}
                </button>
              ))}

            </div>

          </div>

        </div>

        {/* CENTER */}

        <div className="flex-1 overflow-y-auto">

          {activeTab === "builder" && (
            <div className="p-10">

              <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">

                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="p-12 border-b border-gray-100"
                  >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      {section.headline}
                    </h2>

                    <p className="text-gray-600 text-lg">
                      {section.content}
                    </p>

                    {section.type === "cta" && (
                      <button className="mt-6 bg-cyan-500 px-6 py-3 rounded-xl font-semibold text-black">
                        Get Started
                      </button>
                    )}
                  </div>
                ))}

              </div>

            </div>
          )}

          {activeTab === "flow" && (
            <div className="p-10">

              <div className="max-w-3xl mx-auto bg-white/5 rounded-3xl border border-white/10 p-10">

                <h2 className="text-2xl font-bold mb-10">
                  Funnel Flow
                </h2>

                <div className="space-y-8">

                  {[
                    "Landing Page",
                    "Lead Form",
                    "Thank You Page",
                    "Calendar Booking",
                    "CRM",
                  ].map((step) => (
                    <div
                      key={step}
                      className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center"
                    >
                      {step}
                    </div>
                  ))}

                </div>

              </div>

            </div>
          )}

          {activeTab === "analytics" && (
            <div className="p-10">

              <div className="grid grid-cols-4 gap-4">

                {[
                  ["Visitors", "4,250"],
                  ["Leads", "352"],
                  ["Revenue", "$18,500"],
                  ["Conversion", "8.3%"],
                ].map(([title, value]) => (
                  <div
                    key={title}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  >
                    <p className="text-zinc-500 text-sm">
                      {title}
                    </p>

                    <p className="text-3xl font-bold mt-2">
                      {value}
                    </p>
                  </div>
                ))}

              </div>

            </div>
          )}

          {activeTab === "seo" && (
            <div className="p-10 max-w-4xl">

              <div className="space-y-5">

                <input
                  placeholder="Meta Title"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                />

                <textarea
                  placeholder="Meta Description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 h-32"
                />

                <input
                  placeholder="Keywords"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3"
                />

              </div>

            </div>
          )}

          {activeTab === "settings" && (
            <div className="p-10">

              <div className="space-y-4 max-w-xl">

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  Domain Settings
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  Tracking & Pixels
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                  Publishing Settings
                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR */}

        <div className="w-[380px] border-l border-white/10 p-5 overflow-y-auto">

          <h2 className="font-semibold mb-4">
            Inspector
          </h2>

          <div className="space-y-4">

            <div>
              <label className="text-xs text-zinc-500">
                Headline
              </label>

              <input
                value={selectedSection.headline}
                onChange={(e) =>
                  updateSection(
                    "headline",
                    e.target.value
                  )
                }
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500">
                Content
              </label>

              <textarea
                value={selectedSection.content}
                onChange={(e) =>
                  updateSection(
                    "content",
                    e.target.value
                  )
                }
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl p-3 h-40"
              />
            </div>

            <div className="pt-4 border-t border-white/10">

              <h3 className="text-sm font-semibold mb-3">
                AI Assistant
              </h3>

              <div className="space-y-2">

                <button className="w-full bg-purple-500/20 text-purple-400 p-3 rounded-xl text-left">
                  ✨ Generate Headline
                </button>

                <button className="w-full bg-purple-500/20 text-purple-400 p-3 rounded-xl text-left">
                  🚀 Improve Conversion
                </button>

                <button className="w-full bg-purple-500/20 text-purple-400 p-3 rounded-xl text-left">
                  🧠 Rewrite Copy
                </button>

                <button className="w-full bg-purple-500/20 text-purple-400 p-3 rounded-xl text-left">
                  🎯 Generate CTA
                </button>

              </div>

            </div>

            <div className="pt-6 border-t border-white/10">

              <h3 className="font-semibold mb-3">
                Funnel Score
              </h3>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">

                <div className="flex justify-between items-center">

                  <span>Health Score</span>

                  <span className="text-cyan-400 font-bold">
                    84/100
                  </span>

                </div>

                <div className="mt-4 space-y-2 text-xs">

                  <div>✅ Strong CTA</div>
                  <div>✅ Testimonials Found</div>
                  <div>⚠ Improve Headline</div>
                  <div>⚠ Add Urgency</div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}

      <div className="h-14 border-t border-white/10 flex items-center justify-between px-6 text-sm">

        <div className="flex gap-6">
          <span>Visitors: 4,250</span>
          <span>Leads: 352</span>
          <span>Revenue: $18,500</span>
        </div>

        <div className="text-cyan-400">
          Published • Conversion Rate 8.3%
        </div>

      </div>

    </div>
  );
}