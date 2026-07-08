"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  landingPages,
} from "@/lib/mock/landingPages";

export default function LandingPageEditor() {
  const params = useParams();
  const page = landingPages.find(p => p.id === params.id);

  const [name, setName] = useState(page?.name || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [headline, setHeadline] = useState("High-converting headline here");
  const [subheadline, setSubheadline] = useState("Support message that explains value proposition");
  const [cta, setCta] = useState("Get Started");

  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  if (!page) {
    return (
      <div className="p-6 text-white">
        Landing Page not found
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#050505] text-white">

      {/* TOP BAR */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">

        <div className="flex items-center gap-4">
          <Link href="/admin/landing-pages" className="text-zinc-400 hover:text-white">
            ← Back
          </Link>

          <div>
            <h1 className="font-bold">{name}</h1>
            <p className="text-xs text-zinc-500">Landing Page Editor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => setPreviewMode("mobile")}
            className={`px-3 py-1 rounded text-xs ${
              previewMode === "mobile" ? "bg-cyan-500 text-black" : "bg-white/5"
            }`}
          >
            Mobile
          </button>

          <button
            onClick={() => setPreviewMode("desktop")}
            className={`px-3 py-1 rounded text-xs ${
              previewMode === "desktop" ? "bg-cyan-500 text-black" : "bg-white/5"
            }`}
          >
            Desktop
          </button>

          <button className="px-4 py-2 bg-white/10 rounded-xl text-sm">
            AI Generate
          </button>

          <button className="px-4 py-2 bg-cyan-500 text-black rounded-xl font-semibold">
            Save
          </button>

          <button className="px-4 py-2 bg-green-500 text-black rounded-xl font-semibold">
            Publish
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">

        {/* EDITOR */}
        <div className="w-[420px] border-r border-white/10 overflow-y-auto p-5 space-y-6">

          {/* PAGE SETTINGS */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400">Page Settings</h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Page name"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
            />

            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="slug"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
            />
          </div>

          {/* HERO SECTION */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400">Hero Section</h2>

            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm font-semibold"
              placeholder="Headline"
            />

            <textarea
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
              rows={3}
              placeholder="Subheadline"
            />

            <input
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm"
              placeholder="CTA Button"
            />
          </div>

          {/* AI ASSISTANT PANEL */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold">AI Assistant</h3>

            <button className="w-full text-left text-xs p-2 bg-white/5 rounded hover:bg-white/10">
              ✨ Improve headline conversion
            </button>

            <button className="w-full text-left text-xs p-2 bg-white/5 rounded hover:bg-white/10">
              🎯 Generate A/B variants
            </button>

            <button className="w-full text-left text-xs p-2 bg-white/5 rounded hover:bg-white/10">
              📊 Analyze CTR prediction
            </button>

            <button className="w-full text-left text-xs p-2 bg-white/5 rounded hover:bg-white/10">
              🧠 Rewrite for higher intent traffic
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="flex-1 bg-black overflow-y-auto p-10">

          <div
            className={`mx-auto transition-all ${
              previewMode === "mobile" ? "max-w-sm" : "max-w-5xl"
            }`}
          >

            {/* HERO PREVIEW */}
            <div className="text-center py-20 border border-white/10 rounded-2xl bg-white/5">

              <h1 className="text-4xl font-bold mb-4">
                {headline}
              </h1>

              <p className="text-zinc-400 mb-6">
                {subheadline}
              </p>

              <button className="px-6 py-3 bg-cyan-500 text-black rounded-xl font-semibold">
                {cta}
              </button>

            </div>

            {/* MOCK SECTIONS */}
            <div className="mt-10 space-y-4">

              <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                <h3 className="font-semibold mb-2">Problem Section</h3>
                <p className="text-sm text-zinc-400">
                  Explain the user's pain points...
                </p>
              </div>

              <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                <h3 className="font-semibold mb-2">Benefits Section</h3>
                <p className="text-sm text-zinc-400">
                  Show transformation and outcomes...
                </p>
              </div>

              <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                <h3 className="font-semibold mb-2">Social Proof</h3>
                <p className="text-sm text-zinc-400">
                  Testimonials, logos, trust signals...
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}