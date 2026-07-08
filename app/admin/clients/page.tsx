"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  User,
  Building2,
  DollarSign,
  FileText,
  History,
  CreditCard,
  Settings,
  Pencil,
  ArrowRight,
} from "lucide-react"

import { partners as mockPartners } from "@/lib/mock/partners"
import { campaigns as mockCampaigns } from "@/lib/mock/campaigns"
import { deals as mockDeals } from "@/lib/mock/deals"

type ClientTab = "list" | "profile" | "history" | "payments" | "services"

export default function ClientsPage() {
  const [tab, setTab] = useState<ClientTab>("list")
  const [search, setSearch] = useState("")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const clients = mockPartners

  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || null
  }, [selectedClientId])

  const filteredClients = useMemo(() => {
    return clients.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [search])

  const clientStats = useMemo(() => {
    const campaigns = mockCampaigns.filter(
      (c) => c.partnerId === selectedClientId
    )
    const deals = mockDeals.filter((d) => d.partnerId === selectedClientId)

    const revenue = campaigns.reduce((a, c) => a + c.revenue, 0)

    return {
      campaigns: campaigns.length,
      deals: deals.length,
      revenue,
    }
  }, [selectedClientId])

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-sm text-zinc-500">
            Full client intelligence + monetization profiles
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedClientId(null)
            setTab("profile")
          }}
          className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded-xl font-semibold"
        >
          <Plus size={16} />
          New Client
        </button>
      </div>

      {/* TOP TABS */}
      <div className="flex gap-2 overflow-x-auto">
        {["list", "profile", "history", "payments", "services"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t as ClientTab)}
            className={`px-4 py-2 rounded-xl text-sm border transition whitespace-nowrap ${
              tab === t
                ? "bg-cyan-500 text-black border-cyan-500"
                : "bg-white/5 border-white/10 text-zinc-400"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* LIST TAB */}
      {tab === "list" && (
        <div className="space-y-4">

          {/* SEARCH */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-full md:w-[400px]">
            <Search size={16} className="text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* CLIENT LIST */}
          <div className="space-y-3">

            {filteredClients.map((client) => {
              const campaigns = mockCampaigns.filter(
                (c) => c.partnerId === client.id
              )
              const revenue = campaigns.reduce((a, c) => a + c.revenue, 0)

              return (
                <div
                  key={client.id}
                  className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition"
                >

                  {/* LEFT */}
                  <div className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Building2 size={18} className="text-cyan-400" />
                    </div>

                    <div>
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-xs text-zinc-500">
                        Industry • ID: {client.id}
                      </p>
                    </div>
                  </div>

                  {/* MIDDLE STATS */}
                  <div className="hidden md:flex items-center gap-10 text-sm">

                    <div>
                      <p className="text-zinc-500 text-xs">Campaigns</p>
                      <p className="font-semibold">{campaigns.length}</p>
                    </div>

                    <div>
                      <p className="text-zinc-500 text-xs">Revenue</p>
                      <p className="font-semibold text-green-400">
                        ${revenue.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-zinc-500 text-xs">Status</p>
                      <p className="font-semibold text-cyan-400">Active</p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex items-center gap-2">

                    <button
                      onClick={() => {
                        setSelectedClientId(client.id)
                        setTab("profile")
                      }}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm"
                    >
                      View
                    </button>

                    <button
                      onClick={() => {
                        setSelectedClientId(client.id)
                        setTab("profile")
                      }}
                      className="px-3 py-2 rounded-xl bg-cyan-500 text-black text-sm font-semibold flex items-center gap-1"
                    >
                      Open <ArrowRight size={14} />
                    </button>
                  </div>

                </div>
              )
            })}

          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* PROFILE CARD */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">

            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedClient?.name || "New Client"}
                </h2>
                <p className="text-sm text-zinc-500">
                  Full business intelligence profile
                </p>
              </div>

              <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm">
                <Pencil size={14} />
                Edit
              </button>
            </div>

            {/* CORE INFO */}
            <div className="grid md:grid-cols-2 gap-4">

              <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Industry</p>
                <p className="font-semibold">Construction</p>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Status</p>
                <p className="font-semibold text-cyan-400">Active</p>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Total Revenue</p>
                <p className="font-semibold text-green-400">
                  ${clientStats.revenue.toLocaleString()}
                </p>
              </div>

              <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Deals</p>
                <p className="font-semibold">{clientStats.deals}</p>
              </div>

            </div>

            {/* DESCRIPTION / NOTES */}
            <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-zinc-500 mb-2">Client Notes</p>
              <p className="text-sm text-zinc-300">
                High value client. Interested in scaling lead generation and automation.
              </p>
            </div>

          </div>

          {/* SIDE ACTION PANEL */}
          <div className="space-y-4">

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <p className="font-semibold">Quick Actions</p>

              <button className="w-full flex items-center justify-between bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                <span className="flex items-center gap-2">
                  <FileText size={14} /> Create Campaign
                </span>
                <ArrowRight size={14} />
              </button>

              <button className="w-full flex items-center justify-between bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                <span className="flex items-center gap-2">
                  <DollarSign size={14} /> Add Revenue Stream
                </span>
                <ArrowRight size={14} />
              </button>

              <button className="w-full flex items-center justify-between bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                <span className="flex items-center gap-2">
                  <Settings size={14} /> Configure Services
                </span>
                <ArrowRight size={14} />
              </button>

            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <p className="font-semibold mb-2">Activity</p>
              <p className="text-xs text-zinc-500">
                Last campaign created 3 days ago
              </p>
              <p className="text-xs text-zinc-500">
                2 payments processed this month
              </p>
            </div>

          </div>

        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <History size={16} />
            <p className="font-semibold">Client History</p>
          </div>
          <p className="text-sm text-zinc-500">
            Timeline of campaigns, deals, reports, and interactions.
          </p>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {tab === "payments" && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} />
            <p className="font-semibold">Payments</p>
          </div>
          <p className="text-sm text-zinc-500">
            Billing history, invoices, credit usage, and transactions.
          </p>
        </div>
      )}

      {/* SERVICES TAB */}
      {tab === "services" && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} />
            <p className="font-semibold">Services</p>
          </div>
          <p className="text-sm text-zinc-500">
            AI services, funnels, automations and deliverables per client.
          </p>
        </div>
      )}

    </div>
  )
}