"use client"

import Link from "next/link"
import { leadRoutingRules as mockRules } from "@/lib/mock/leadRoutingRules"
import { partners as mockPartners } from "@/lib/mock/partners"
import { LeadRoutingRule, LeadRoutingCondition } from "@/lib/models/leadRoutingRule"

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  draft: "bg-gray-100 text-gray-700",
}

const actionStyles: Record<string, string> = {
  assign_partner: "bg-purple-100 text-purple-700",
  list_marketplace: "bg-cyan-100 text-cyan-700",
  queue_review: "bg-blue-100 text-blue-700",
  auto_nurture: "bg-amber-100 text-amber-700",
  discard: "bg-red-100 text-red-700",
}

const actionLabel: Record<string, string> = {
  assign_partner: "Assign Partner",
  list_marketplace: "List on Marketplace",
  queue_review: "Queue for Review",
  auto_nurture: "Auto Nurture",
  discard: "Discard",
}

const operatorLabel: Record<string, string> = {
  equals: "=",
  in: "in",
  gte: "≥",
  lte: "≤",
}

const formatCondition = (c: LeadRoutingCondition) => {
  const value = Array.isArray(c.value) ? `[${c.value.join(", ")}]` : c.value
  return `${c.field} ${operatorLabel[c.operator]} ${value}`
}

const formatActionTarget = (rule: LeadRoutingRule) => {
  if (!rule.actionTarget) return "—"
  if (rule.action === "assign_partner") {
    const partner = mockPartners.find(p => p.id === rule.actionTarget)
    return partner?.name || rule.actionTarget
  }
  return rule.actionTarget.replace(/_/g, " ")
}

const calculateRoutingRate = (rule: LeadRoutingRule) => {
  if (!rule.matchedLeads) return 0
  return (rule.routedLeads / rule.matchedLeads) * 100
}

const calculateConversionRate = (rule: LeadRoutingRule) => {
  if (!rule.routedLeads) return 0
  return (rule.conversions / rule.routedLeads) * 100
}

export default function LeadRoutingPage() {
  const sortedRules = [...mockRules].sort((a, b) => a.priority - b.priority)
  const activeRules = mockRules.filter(r => r.status === "active").length
  const totalMatched = mockRules.reduce((acc, r) => acc + r.matchedLeads, 0)
  const totalRouted = mockRules.reduce((acc, r) => acc + r.routedLeads, 0)
  const totalConversions = mockRules.reduce((acc, r) => acc + r.conversions, 0)
  const avgConversionRate = totalRouted > 0 ? (totalConversions / totalRouted) * 100 : 0

  return (
    <div className="space-y-6 w-full min-w-0">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold">Lead Routing</h1>
        <Link
          href="/admin/lead-routing/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-center"
        >
          + New Rule
        </Link>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Total Rules</h3>
          <p className="mt-2 text-2xl font-bold">{mockRules.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Active</h3>
          <p className="mt-2 text-2xl font-bold">{activeRules}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Matched Leads</h3>
          <p className="mt-2 text-2xl font-bold">{totalMatched.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm text-gray-500">Routed Leads</h3>
          <p className="mt-2 text-2xl font-bold">{totalRouted.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 col-span-2 lg:col-span-1">
          <h3 className="text-sm text-gray-500">Avg Conv. Rate</h3>
          <p className="mt-2 text-2xl font-bold">{avgConversionRate.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-gray-400">{totalConversions} conversions</p>
        </div>
      </div>

      {/* RULES TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 w-16">Priority</th>
              <th className="text-left p-4">Rule</th>
              <th className="text-left p-4">Conditions</th>
              <th className="text-left p-4">Action</th>
              <th className="text-left p-4">Target</th>
              <th className="text-left p-4">Matched</th>
              <th className="text-left p-4">Routed</th>
              <th className="text-left p-4">Routing Rate</th>
              <th className="text-left p-4">Conversions</th>
              <th className="text-left p-4">Conv. Rate</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedRules.map(rule => {
              const routingRate = calculateRoutingRate(rule)
              const convRate = calculateConversionRate(rule)
              return (
                <tr key={rule.id} className="border-t hover:bg-purple-50 align-top">
                  <td className="p-4 font-mono font-bold text-purple-700">#{rule.priority}</td>
                  <td className="p-4 font-medium">
                    <Link href={`/admin/lead-routing/${rule.id}`}>
                      {rule.name}
                    </Link>
                    {rule.description && (
                      <p className="text-xs text-zinc-500 mt-1 max-w-xs">{rule.description}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs uppercase text-zinc-400">
                        match {rule.matchMode}
                      </span>
                      {rule.conditions.map((c, i) => (
                        <code key={i} className="text-xs bg-gray-50 px-2 py-1 rounded inline-block w-fit">
                          {formatCondition(c)}
                        </code>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${actionStyles[rule.action]}`}>
                      {actionLabel[rule.action]}
                    </span>
                  </td>
                  <td className="p-4 capitalize">{formatActionTarget(rule)}</td>
                  <td className="p-4">{rule.matchedLeads.toLocaleString()}</td>
                  <td className="p-4">{rule.routedLeads.toLocaleString()}</td>
                  <td className="p-4 font-semibold text-cyan-600">{routingRate.toFixed(1)}%</td>
                  <td className="p-4 font-bold">{rule.conversions.toLocaleString()}</td>
                  <td className="p-4 font-semibold text-green-600">{convRate.toFixed(1)}%</td>
                  <td className="p-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[rule.status] || "bg-gray-100 text-gray-700"}`}>
                      {rule.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
