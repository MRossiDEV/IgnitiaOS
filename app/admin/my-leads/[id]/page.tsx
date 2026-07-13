import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  Star,
  ExternalLink,
  Clock3,
} from "lucide-react";

import { notFound } from "next/navigation";

import { supabaseAdmin } from "@/lib/supabase/server";
import LeadCRMPanel from "./LeadCRMPanel";

type Lead = {
    id: string;
    report_code: string;
    access_code: string;
    status: string;
    created_at: string;
    updated_at: string;
    viewed_at: string | null;
    viewed_count: number;
    expires_at: string | null;
    full_name: string;
    email: string;
    phone: string | null;
    business_name: string;
    website: string | null;
    industry: string | null;
    business_type: string | null;
    business_size: string | null;
    city: string | null;
    country: string | null;
    primary_goal: string | null;
    biggest_challenge: string | null;
    monthly_leads: string | null;
    marketing_channels: string[];
    competitors: string[];
    ai_summary: string | null;
    overall_score: number;
    website_score: number;
    seo_score: number;
    google_score: number;
    social_score: number;
    conversion_score: number;
    strengths: string[];
    opportunities: string[];
    quick_wins: string[];
    executive_score: number;
    executive_preview: any;
    recommended_services: any[];
    estimated_growth: string | null;
};

function badge(status: string) {
  switch (status) {
    case "completed":
      return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";

    case "processing":
      return "bg-yellow-500/15 border-yellow-500/30 text-yellow-400";

    case "failed":
      return "bg-red-500/15 border-red-500/30 text-red-400";

    default:
      return "bg-zinc-700 border-zinc-600 text-zinc-300";
  }
}

function scoreColor(score: number) {
  if (score >= 80)
    return "text-emerald-400";

  if (score >= 60)
    return "text-yellow-400";

  return "text-red-400";
}

export default async function LeadPage({
  params,
}: {
    params: { id: string };
}) {
    const leadId = params.id;  

    const { data: crm } = await supabaseAdmin
    .from("lead_crm")
    .select("*")
    .eq("report_id", leadId)
    .maybeSingle();

  if (!crm) {
    notFound();
  }

  const lead = await supabaseAdmin
    .from("free_reports")
  .select(`
    *,
    lead_crm (
      status,
      priority,
      estimated_value,
      probability,
      follow_up
    )
  `)
    .eq("id", leadId)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error || !data) {
        notFound();
      }
      return data as Lead;
    });

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>

          <Link
            href="/admin/my-leads"
            className="mb-5 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={16} />

            Back to Leads
          </Link>

          <h1 className="text-4xl font-bold">
            {lead.business_name}
          </h1>

          <p className="mt-2 text-zinc-400">
            {lead.full_name}
          </p>

        </div>

        <span
          className={`rounded-full border px-4 py-2 text-sm font-semibold ${badge(
            lead.status
          )}`}
        >
          {lead.status}
        </span>

      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 lg:grid-cols-5">

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

          <Activity className="text-blue-400" />

          <div
            className={`mt-5 text-4xl font-bold ${scoreColor(
              lead.overall_score
            )}`}
          >
            {lead.overall_score}
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Overall Score
          </p>

        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

          <Globe className="text-cyan-400" />

          <div className="mt-5 text-4xl font-bold">
            {lead.website_score}
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Website
          </p>

        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

          <TrendingUp className="text-green-400" />

          <div className="mt-5 text-4xl font-bold">
            {lead.seo_score}
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            SEO
          </p>

        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

          <Target className="text-orange-400" />

          <div className="mt-5 text-4xl font-bold">
            {lead.conversion_score}
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Conversion
          </p>

        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

          <Star className="text-yellow-400" />

          <div className="mt-5 text-4xl font-bold">
            {lead.google_score}
          </div>

          <p className="mt-2 text-sm text-zinc-500">
            Google
          </p>

        </div>

      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">

        {/* Left */}
        <div className="space-y-8 lg:col-span-2">

          {/* Company */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-7">

            <h2 className="mb-6 text-2xl font-bold">
              Company Information
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

              <div className="flex gap-4">

                <Building2 className="mt-1 text-blue-400" />

                <div>

                  <div className="text-sm text-zinc-500">
                    Business
                  </div>

                  <div className="font-semibold">
                    {lead.business_name}
                  </div>

                </div>

              </div>

              <div className="flex gap-4">

                <Mail className="mt-1 text-blue-400" />

                <div>

                  <div className="text-sm text-zinc-500">
                    Email
                  </div>

                  <div className="font-semibold">
                    {lead.email}
                  </div>

                </div>

              </div>

              <div className="flex gap-4">

                <Phone className="mt-1 text-blue-400" />

                <div>

                  <div className="text-sm text-zinc-500">
                    Phone
                  </div>

                  <div className="font-semibold">
                    {lead.phone || "-"}
                  </div>

                </div>

              </div>

              <div className="flex gap-4">

                <MapPin className="mt-1 text-blue-400" />

                <div>

                  <div className="text-sm text-zinc-500">
                    Location
                  </div>

                  <div className="font-semibold">
                    {[lead.city, lead.country]
                      .filter(Boolean)
                      .join(", ") || "-"}
                  </div>

                </div>

              </div>

              <div className="flex gap-4">

                <Target className="mt-1 text-blue-400" />

                <div>

                  <div className="text-sm text-zinc-500">
                    Primary Goal
                  </div>

                  <div className="font-semibold">
                    {lead.primary_goal || "-"}
                  </div>

                </div>

              </div>

              <div className="flex gap-4">

                <Calendar className="mt-1 text-blue-400" />

                <div>

                  <div className="text-sm text-zinc-500">
                    Created
                  </div>

                  <div className="font-semibold">
                    {new Date(
                      lead.created_at
                    ).toLocaleString()}
                  </div>

                </div>

              </div>

            </div>

            {lead.website && (

              <a
                href={
                  lead.website.startsWith("http")
                    ? lead.website
                    : `https://${lead.website}`
                }
                target="_blank"
                className="mt-8 inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-blue-400 transition hover:bg-blue-500/20"
              >

                <ExternalLink size={18} />

                Visit Website

              </a>

            )}

                  </div>
                {/* Executive Summary */}

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-7">

            <h2 className="text-2xl font-bold">
              AI Executive Summary
            </h2>

            <p className="mt-5 whitespace-pre-line leading-8 text-zinc-300">
              {lead.ai_summary ||
                "The AI analysis is still processing. Refresh this page in a few moments."}
            </p>

          </div>

          {/* Strengths */}

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-7">

            <h2 className="text-2xl font-bold text-emerald-400">
              Strengths
            </h2>

            {lead.strengths?.length ? (

              <div className="mt-6 space-y-4">

                {lead.strengths.map((item, index) => (

                  <div
                    key={index}
                    className="flex gap-4"
                  >

                    <div className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />

                    <p className="leading-7 text-zinc-300">
                      {item}
                    </p>

                  </div>

                ))}

              </div>

            ) : (

              <p className="mt-5 text-zinc-500">
                No strengths generated.
              </p>

            )}

          </div>

          {/* Opportunities */}

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-7">

            <h2 className="text-2xl font-bold text-yellow-400">
              Opportunities
            </h2>

            {lead.opportunities?.length ? (

              <div className="mt-6 space-y-4">

                {lead.opportunities.map((item, index) => (

                  <div
                    key={index}
                    className="flex gap-4"
                  >

                    <div className="mt-2 h-2 w-2 rounded-full bg-yellow-400" />

                    <p className="leading-7 text-zinc-300">
                      {item}
                    </p>

                  </div>

                ))}

              </div>

            ) : (

              <p className="mt-5 text-zinc-500">
                No opportunities generated.
              </p>

            )}

          </div>

          {/* Quick Wins */}

          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-7">

            <h2 className="text-2xl font-bold text-cyan-400">
              Quick Wins
            </h2>

            {lead.quick_wins?.length ? (

              <div className="mt-6 space-y-4">

                {lead.quick_wins.map((item, index) => (

                  <div
                    key={index}
                    className="flex gap-4"
                  >

                    <div className="mt-2 h-2 w-2 rounded-full bg-cyan-400" />

                    <p className="leading-7 text-zinc-300">
                      {item}
                    </p>

                  </div>

                ))}

              </div>

            ) : (

              <p className="mt-5 text-zinc-500">
                No quick wins generated.
              </p>

            )}

          </div>

          {/* Recommended Services */}

          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-7">

            <h2 className="text-2xl font-bold text-purple-400">
              Recommended Services
            </h2>

            {lead.recommended_services?.length ? (

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                {lead.recommended_services.map(
                  (
                    service: any,
                    index: number
                  ) => (

                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-zinc-900 p-5"
                    >

                      <h3 className="font-semibold">
                        {service.title ??
                          service.name ??
                          service}
                      </h3>

                      {service.description && (

                        <p className="mt-2 text-sm leading-6 text-zinc-400">
                          {service.description}
                        </p>

                      )}

                    </div>

                  )
                )}

              </div>

            ) : (

              <p className="mt-5 text-zinc-500">
                No recommendations available.
              </p>

            )}

          </div>

          {/* Estimated Growth */}

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-7">

            <h2 className="text-2xl font-bold text-green-400">
              Estimated Growth Potential
            </h2>

            <p className="mt-5 whitespace-pre-line leading-8 text-zinc-300">
              {lead.estimated_growth ||
                "Not calculated."}
            </p>

          </div>

        </div>
      
        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Contact Actions */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <h2 className="text-xl font-bold">
              Actions
            </h2>

            <div className="mt-6 space-y-3">

              <a
                href={`mailto:${lead.email}`}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
              >
                <Mail size={18} />
                Send Email
              </a>

              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 px-5 py-3 transition hover:border-blue-500"
                >
                  <Phone size={18} />
                  Call
                </a>
              )}

              {lead.website && (
                <a
                  href={
                    lead.website.startsWith("http")
                      ? lead.website
                      : `https://${lead.website}`
                  }
                  target="_blank"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 px-5 py-3 transition hover:border-blue-500"
                >
                  <Globe size={18} />
                  Visit Website
                </a>
              )}

            </div>

          </div>

          {/* Report Information */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <h2 className="text-xl font-bold">
              Report Information
            </h2>

            <div className="mt-6 space-y-5 text-sm">

              <div>
                <div className="text-zinc-500">
                  Report Code
                </div>

                <div className="mt-1 font-mono">
                  {lead.report_code}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">
                  Access Code
                </div>

                <div className="mt-1 font-mono">
                  {lead.access_code}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">
                  Status
                </div>

                <div className="mt-1 capitalize">
                  {lead.status}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">
                  Created
                </div>

                <div className="mt-1">
                  {new Date(
                    lead.created_at
                  ).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">
                  Updated
                </div>

                <div className="mt-1">
                  {new Date(
                    lead.updated_at
                  ).toLocaleString()}
                </div>
              </div>

              {lead.expires_at && (
                <div>
                  <div className="text-zinc-500">
                    Expires
                  </div>

                  <div className="mt-1">
                    {new Date(
                      lead.expires_at
                    ).toLocaleDateString()}
                  </div>
                </div>
              )}

              <div>
                <div className="text-zinc-500">
                  Views
                </div>

                <div className="mt-1">
                  {lead.viewed_count}
                </div>
              </div>

            </div>

          </div>

          {/* Business Profile */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <h2 className="text-xl font-bold">
              Business Profile
            </h2>

            <div className="mt-6 space-y-5 text-sm">

              <div>
                <div className="text-zinc-500">
                  Industry
                </div>

                <div className="mt-1">
                  {lead.industry || "-"}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">
                  Business Type
                </div>

                <div className="mt-1">
                  {lead.business_type || "-"}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">
                  Company Size
                </div>

                <div className="mt-1">
                  {lead.business_size || "-"}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">
                  Monthly Leads
                </div>

                <div className="mt-1">
                  {lead.monthly_leads || "-"}
                </div>
              </div>

              <div>
                <div className="text-zinc-500">
                  Biggest Challenge
                </div>

                <div className="mt-1 leading-6">
                  {lead.biggest_challenge || "-"}
                </div>
              </div>

            </div>

          </div>

          {/* Score Breakdown */}

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">

            <h2 className="text-xl font-bold">
              Score Breakdown
            </h2>

            <div className="mt-6 space-y-5">

              {[
                ["Website", lead.website_score],
                ["SEO", lead.seo_score],
                ["Google", lead.google_score],
                ["Social", lead.social_score],
                ["Conversion", lead.conversion_score],
              ].map(([label, score]) => (
                <div key={label}>

                  <div className="mb-2 flex justify-between text-sm">

                    <span>{label}</span>

                    <span className="font-semibold">
                      {score}/100
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-zinc-800">

                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${score}%`,
                      }}
                    />

                  </div>

                </div>
              ))}

            </div>

                  </div>
                  
                  {/* CRM Panel */}
            <LeadCRMPanel
            reportId={lead.id}
            crm={crm}
            />

        </div>

      </div>

    </div>
  );
}