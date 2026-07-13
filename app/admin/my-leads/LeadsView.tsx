"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  LayoutGrid,
  Table2,
  Building2,
  User,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";

type Lead = {
  id: string;

  full_name: string;

  email: string;

  phone: string | null;

  business_name: string;

  website: string | null;

  industry: string | null;

  city: string | null;

  created_at: string;

  overall_score: number;

  executive_score: number;

  status?: string;

  priority?: string;

  estimated_value?: number;

  probability?: number;

    follow_up?: string | null;
  lead_crm?: {
    status?: string;
    priority?: string;
    estimated_value?: number;
    probability?: number;
    follow_up?: string | null;
  };
};

interface Props {
  leads: Lead[];
}

const columns = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal Sent",
  "Negotiating",
  "Won",
  "Lost",
];

export default function LeadViews({
  leads,
}: Props) {
    const [view, setView] = useState<"table" | "kanban">("table");
    
    console.log(leads);

  const grouped =
    useMemo(() => {
      const map: Record<
        string,
        Lead[]
      > = {};

      columns.forEach(
        (column) =>
          (map[column] = [])
      );

      leads.forEach((lead) => {
    const status = lead.lead_crm?.status ?? "New";

        if (!map[status])
          map[status] = [];

        map[status].push(lead);
      });

      return map;
    }, [leads]);

  return (
    <>

      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            My Leads
          </h1>

          <p className="mt-2 text-zinc-500">
            Manage your sales
            pipeline.
          </p>

        </div>

        <div className="flex rounded-xl border border-white/10 bg-zinc-900 p-1">

          <button
            onClick={() =>
              setView("table")
            }
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
              view === "table"
                ? "bg-blue-600"
                : ""
            }`}
          >
            <Table2 size={16} />
            Table
          </button>

          <button
            onClick={() =>
              setView("kanban")
            }
            className={`ml-1 flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
              view === "kanban"
                ? "bg-blue-600"
                : ""
            }`}
          >
            <LayoutGrid
              size={16}
            />
            Kanban
          </button>

        </div>

      </div>

      {/* TABLE */}
      {view === "table" && (

        <div className="overflow-hidden rounded-2xl border border-white/10">

          <table className="w-full">

            <thead className="bg-zinc-900">

              <tr className="text-left text-sm text-zinc-400">

                <th className="p-4">
                  Lead
                </th>

                <th className="p-4">
                  Business
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Priority
                </th>

                <th className="p-4">
                  Score
                </th>

                <th className="p-4">
                  Value
                </th>

                <th className="p-4"></th>

              </tr>

            </thead>

            <tbody>

              {leads.map(
                (lead) => (

                  <tr
                    key={lead.id}
                    className="border-t border-white/10"
                  >

                    <td className="p-4">

                      <div className="font-semibold">
                        {lead.full_name}
                      </div>

                      <div className="mt-1 text-sm text-zinc-500">
                        {lead.email}
                      </div>

                    </td>

                    <td className="p-4">

                      <div className="font-medium">
                        {lead.business_name}
                      </div>

                      <div className="mt-1 text-sm text-zinc-500">
                        {lead.industry}
                      </div>

                    </td>

                    <td className="p-4">
                      {lead.lead_crm?.status ??
                        "New"}
                    </td>

                    <td className="p-4">
                      {lead.lead_crm?.priority ??
                        "Medium"}
                    </td>

                    <td className="p-4">
                      {lead.overall_score}
                    </td>

                    <td className="p-4">
                      USD${lead.lead_crm?.estimated_value ?? "-"}
                    </td>

                    <td className="p-4">

                      <Link
                        href={`/admin/my-leads/${lead.id}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm"
                      >
                        Open

                        <ArrowRight
                          size={16}
                        />

                      </Link>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

          )}
            {/* KANBAN */}

      {view === "kanban" && (

        <div className="overflow-x-auto pb-6">

          <div className="flex gap-5 min-w-max">

            {columns.map((column) => (

              <div
                key={column}
                className="w-80 shrink-0"
              >

                {/* COLUMN HEADER */}

                <div className="mb-4 rounded-xl border border-white/10 bg-zinc-900 p-4">

                  <div className="flex items-center justify-between">

                    <h3 className="font-semibold">
                      {column}
                    </h3>

                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
                      {grouped[column]?.length ?? 0}
                    </span>

                  </div>

                </div>

                {/* CARDS */}

                <div className="space-y-4">

                  {grouped[column]?.length === 0 && (

                    <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/40 p-6 text-center text-sm text-zinc-500">

                      No leads

                    </div>

                  )}

                  {grouped[column]?.map((lead) => (

                    <Link
                      key={lead.id}
                      href={`/admin/my-leads/${lead.id}`}
                      className="block rounded-2xl border border-white/10 bg-zinc-900 p-5 transition hover:border-blue-500 hover:bg-zinc-800"
                    >

                      {/* COMPANY */}

                      <div className="flex items-start justify-between">

                        <div>

                          <div className="flex items-center gap-2 font-semibold">

                            <Building2 size={16} />

                            {lead.business_name}

                          </div>

                          <p className="mt-1 text-sm text-zinc-500">
                            {lead.industry || "No industry"}
                          </p>

                        </div>

                        <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400">

                          {lead.priority ?? "Medium"}

                        </span>

                      </div>

                      {/* CONTACT */}

                      <div className="mt-5 space-y-2 text-sm">

                        <div className="flex items-center gap-2 text-zinc-300">

                          <User size={14} />

                          {lead.full_name}

                        </div>

                        <div className="flex items-center gap-2 text-zinc-400">

                          <Mail size={14} />

                          {lead.email}

                        </div>

                        {lead.phone && (

                          <div className="flex items-center gap-2 text-zinc-400">

                            <Phone size={14} />

                            {lead.phone}

                          </div>

                        )}

                      </div>

                      {/* SCORE */}

                      <div className="mt-5">

                        <div className="flex items-center justify-between text-xs text-zinc-500">

                          <span>Overall Score</span>

                          <span>{lead.overall_score}/100</span>

                        </div>

                        <div className="mt-2 h-2 rounded-full bg-zinc-800">

                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{
                              width: `${lead.overall_score}%`,
                            }}
                          />

                        </div>

                      </div>

                      {/* FOOTER */}

                      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

                        <div>

                          <p className="text-xs text-zinc-500">

                            Estimated Value

                          </p>

                          <p className="font-semibold">

                            {lead.lead_crm?.estimated_value
                              ? `$${Number(
                                  lead.lead_crm?.estimated_value
                                ).toLocaleString()}`
                              : "-"}

                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-xs text-zinc-500">

                            Probability

                          </p>

                          <p className="font-semibold">

                            {lead.lead_crm?.probability ?? 50}%

                          </p>

                        </div>

                      </div>

                    </Link>

                  ))}

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </>

  );

}