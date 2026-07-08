"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Brain,
  Rocket,
  Wand2,
  Save,
  Sparkles,
  Globe,
  Target,
  Loader2,
  DollarSign,
  Calendar,
  User,
} from "lucide-react";

import Hero from "./comp/hero";




export default function NewCampaignPage() {

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
      name: "",
      description: "",
      industry: "Real Estate",
      objective: "",
      status: "draft",
      channel: "Multi Channel",

      budget: 0,

      targetCountry: "United States",
      targetCity: "",
      language: "English",

      offer: "",

      aiPrompt: "",

      startDate: "",
      endDate: "",
  });

  const industries = [
      "Real Estate",
      "Immigration",
      "Legal",
      "Healthcare",
      "Finance",
      "Construction",
      "Education",
      "Insurance",
      "Home Services",
      "Technology",
  ];

  async function saveCampaign() {
      try {
      setSaving(true);

      const response = await fetch(
          "/api/admin/campaigns",
          {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              name: form.name,
              description: form.description,
              industry: form.industry,
              objective: form.objective,
              status: form.status,
              channel: form.channel,
              budget: Number(form.budget),

              target_country: form.targetCountry,
              target_city: form.targetCity,
              language: form.language,

              offer: form.offer,
              ai_prompt: form.aiPrompt,

              start_date: form.startDate,
              end_date: form.endDate,
          }),
          }
      );

      if (!response.ok)
          throw new Error();

      alert("Campaign created.");

      location.href="/admin/campaigns";

      } catch {

      alert("Error saving campaign");

      } finally {

      setSaving(false);

      }
  }

  return (
    <div className="space-y-8 text-white">

      {/* HERO */}
      <Hero />


      {/* CAMPAIGN DETAILS */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

        <div className="flex items-center gap-3 mb-8">

          <Rocket className="text-cyan-400"/>

          <h2 className="text-2xl font-bold">
          Campaign Information
          </h2>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-zinc-400">
            Campaign Name
            </label>
            <input
            value={form.name}
            onChange={(e)=>update("name",e.target.value)}
            className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            />
          </div>
        <div>

        <label className="text-sm text-zinc-400">
        Industry
        </label>

        <select
        value={form.industry}
        onChange={(e)=>update("industry",e.target.value)}
        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
        >

        {industries.map(i=>(
        <option key={i}>
        {i}
        </option>
        ))}

        </select>

        </div>

        <div>

        <label className="text-sm text-zinc-400">
        Objective
        </label>

        <input
        value={form.objective}
        onChange={(e)=>update("objective",e.target.value)}
        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
        />

        </div>

        <div>

        <label className="text-sm text-zinc-400">
        Status
        </label>

        <select
        value={form.status}
        onChange={(e)=>update("status",e.target.value)}
        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
        >

        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>

        </select>

        </div>

        <div className="lg:col-span-2">

        <label className="text-sm text-zinc-400">
        Description
        </label>

        <textarea
        rows={5}
        value={form.description}
        onChange={(e)=>update("description",e.target.value)}
        className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
        />

        </div>

        </div>

      </div>

      {/* AI CAMPAIGN ARCHITECT */}
      <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8">

        <div className="flex items-center gap-3 mb-6">
          <Brain className="text-cyan-400" />
          <h2 className="text-2xl font-bold">
            AI Campaign Architect
          </h2>
        </div>

        <p className="text-zinc-400 mb-6">
          Describe your business, your target customer and your goals.
          Ignitia AI will generate the complete campaign automatically.
        </p>

        <textarea
          rows={8}
          value={form.aiPrompt}
          onChange={(e) => update("aiPrompt", e.target.value)}
          placeholder="Example:
      I own an immigration agency in Uruguay.
      Generate a complete funnel for Americans wanting residency.
      Target high-income families aged 35-60.
      Generate Facebook Ads, Landing Page, Qualification AI and Email Follow-up."
          className="w-full rounded-2xl bg-black/30 border border-white/10 p-5 outline-none"
        />

        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mt-8">

          {[
            "Landing Page",
            "Facebook Ads",
            "Google Ads",
            "Email Sequence",
            "AI Chatbot",
            "Qualification",
            "SEO",
            "Blog Articles",
            "Images",
            "Videos",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-cyan-500/20 bg-black/20 p-4"
            >
              <Sparkles className="text-cyan-400 mb-3" size={18} />

              <h3 className="font-semibold">
                {item}
              </h3>

              <p className="text-xs text-zinc-500 mt-2">
                Will be generated automatically.
              </p>
            </div>
          ))}

        </div>

        <button
          className="mt-8 px-8 py-4 rounded-2xl bg-cyan-500 text-black font-bold flex items-center gap-3"
        >
          <Wand2 size={18} />
          Generate Complete Campaign
        </button>

      </div>

      {/* TARGET AUDIENCE */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

        <div className="flex items-center gap-3 mb-8">
          <Globe className="text-cyan-400" />
          <h2 className="text-2xl font-bold">
            Audience Builder
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          <div>
            <label className="text-sm text-zinc-400">
              Country
            </label>

            <select
              value={form.targetCountry}
              onChange={(e) =>
                update("targetCountry", e.target.value)
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Brazil</option>
              <option>Argentina</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              City
            </label>

            <input
              value={form.targetCity}
              onChange={(e) =>
                update("targetCity", e.target.value)
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Language
            </label>

            <select
              value={form.language}
              onChange={(e) =>
                update("language", e.target.value)
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>Portuguese</option>
              <option>French</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Age From
            </label>

            <input
              type="number"
              defaultValue={30}
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Age To
            </label>

            <input
              type="number"
              defaultValue={65}
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Gender
            </label>

            <select className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4">
              <option>All</option>
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

        </div>

      </div>

      {/* OFFER BUILDER */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

        <div className="flex items-center gap-3 mb-8">
          <Target className="text-cyan-400" />
          <h2 className="text-2xl font-bold">
            Offer Builder
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="space-y-6">

            <div>
              <label className="text-sm text-zinc-400">
                Offer Name
              </label>

              <input
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
                placeholder="Premium Residency Program"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Price
              </label>

              <input
                type="number"
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
                placeholder="2500"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Discount (%)
              </label>

              <input
                type="number"
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
                placeholder="10"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Call To Action
              </label>

              <input
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
                placeholder="Book My Consultation"
              />
            </div>

          </div>

          <div>

            <label className="text-sm text-zinc-400">
              Offer Description
            </label>

            <textarea
              rows={12}
              value={form.offer}
              onChange={(e)=>update("offer",e.target.value)}
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            />

          </div>

        </div>

      </div>

      {/* FUNNEL MODULES */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

        <h2 className="text-2xl font-bold mb-8">
          Funnel Builder
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">

          {[
            "Landing Page",
            "AI Chatbot",
            "Facebook Ads",
            "Google Ads",
            "Email Sequence",
            "SMS",
            "WhatsApp",
            "CRM Pipeline",
            "Calendar Booking",
            "Analytics",
          ].map((item)=>(
            <label
              key={item}
              className="rounded-2xl border border-white/10 bg-black/20 p-5 flex justify-between items-center cursor-pointer hover:border-cyan-500 transition"
            >

              <span>{item}</span>

              <input
                type="checkbox"
                defaultChecked
                className="h-5 w-5"
              />

            </label>
          ))}

        </div>

      </div>

      {/* QUALIFICATION BUILDER */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

        <h2 className="text-2xl font-bold mb-8">
          Lead Qualification
        </h2>

        <div className="space-y-4">

          {[
            "Current Country?",
            "Desired Move Date?",
            "Budget?",
            "Family Members?",
            "Purpose of Relocation?",
            "Current Occupation?",
            "Monthly Income?",
            "Need Legal Assistance?"
          ].map((question,index)=>(
            <div
              key={index}
              className="grid lg:grid-cols-4 gap-4 border border-white/10 rounded-xl p-4"
            >

              <input
                defaultValue={question}
                className="lg:col-span-2 rounded-lg bg-black/30 border border-white/10 p-3"
              />

              <select
                className="rounded-lg bg-black/30 border border-white/10 p-3"
              >
                <option>Text</option>
                <option>Dropdown</option>
                <option>Multiple Choice</option>
                <option>Yes / No</option>
                <option>Number</option>
              </select>

              <input
                type="number"
                defaultValue={10}
                className="rounded-lg bg-black/30 border border-white/10 p-3"
                placeholder="Lead Score"
              />

            </div>
          ))}

        </div>

        <button
          className="mt-6 px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold"
        >
          + Add Question
        </button>

      </div>

      {/* LEAD SCORE */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

        <h2 className="text-2xl font-bold mb-8">
        Lead Scoring
        </h2>

        <div className="grid lg:grid-cols-2 gap-8">

        {[
        ["Budget",40],
        ["Timeline",20],
        ["Intent",20],
        ["Income",10],
        ["Family",10],
        ].map(([title,value])=>(

        <div key={title as string}>

        <div className="flex justify-between mb-2">

        <span>{title}</span>

        <span>{value}%</span>

        </div>

        <input
        type="range"
        defaultValue={value as number}
        className="w-full"
        />

      </div>

      ))}

      </div>

      </div>

      {/* REVENUE PROJECTION */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">Campaign Budget & Projection</h2>

        <div className="grid lg:grid-cols-4 gap-5 mt-6">

          <div>
            <label className="text-sm text-zinc-400">
              Budget
            </label>

            <input
              type="number"
              value={form.budget}
              onChange={(e) =>
                setForm({
                  ...form,
                  budget: Number(e.target.value),
                })
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Expected Revenue
            </label>

            <input
              type="number"
              value={form.revenue}
              onChange={(e) =>
                setForm({
                  ...form,
                  revenue: Number(e.target.value),
                })
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Start Date
            </label>

            <input
              type="date"
              value={form.start_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  start_date: e.target.value,
                })
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              End Date
            </label>

            <input
              type="date"
              value={form.end_date}
              onChange={(e) =>
                setForm({
                  ...form,
                  end_date: e.target.value,
                })
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            />
          </div>

        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-8">

          <Metric
            title="Projected CPC"
            value="$1.20"
          />

          <Metric
            title="CTR"
            value="4.2%"
          />

          <Metric
            title="Estimated Leads"
            value={`${Math.round(form.budget / 5)}`}
          />

          <Metric
            title="Expected ROI"
            value={
              form.budget > 0
                ? `${Math.round(
                    ((form.revenue - form.budget) /
                      form.budget) *
                      100
                  )}%`
                : "0%"
            }
          />

        </div>

      </div>

      {/* SAVE */}
      <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-8">

        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

          <div>

            <h2 className="text-3xl font-black">
              Ready to Launch
            </h2>

            <p className="text-zinc-400 mt-2">
              Save this campaign into the database and
              continue building ads, landing pages,
              automations and AI workflows.
            </p>

          </div>

          <button
            disabled={saving}
            onClick={saveCampaign}
            className="px-8 py-4 rounded-2xl bg-cyan-500 text-black font-bold flex items-center gap-3 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                Save Campaign
                <Rocket size={18} />
              </>
            )}
          </button>

        </div>

      </div>

      {/* BASIC INFORMATION */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">

        <h2 className="text-xl font-bold mb-6">
          Campaign Information
        </h2>

        <div className="grid lg:grid-cols-2 gap-6">

          <div>
            <label className="text-sm text-zinc-400">
              Campaign Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
              placeholder="Uruguay Relocation 2026"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Objective
            </label>

            <select
              value={form.objective}
              onChange={(e) =>
                setForm({
                  ...form,
                  objective: e.target.value,
                })
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            >
              <option value="">Select objective</option>
              <option>Lead Generation</option>
              <option>Sales</option>
              <option>Brand Awareness</option>
              <option>Traffic</option>
              <option>Appointments</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Marketing Channel
            </label>

            <select
              value={form.channel}
              onChange={(e) =>
                setForm({
                  ...form,
                  channel: e.target.value,
                })
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            >
              <option>Facebook</option>
              <option>Instagram</option>
              <option>Google Ads</option>
              <option>LinkedIn</option>
              <option>TikTok</option>
              <option>Email</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-400">
              Campaign Status
            </label>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value,
                })
              }
              className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 p-4"
            >
              <option>draft</option>
              <option>active</option>
              <option>paused</option>
              <option>completed</option>
            </select>
          </div>

        </div>

      </div>



    </div>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-zinc-500 text-sm">
        {title}
      </div>

      <div className="text-3xl font-black mt-2">
        {value}
      </div>
    </div>
  );
}

function ScoreRow({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="flex justify-between rounded-xl border border-white/10 p-4">
      <span>{title}</span>
      <span className="text-cyan-400">{value}</span>
    </div>
  );
}