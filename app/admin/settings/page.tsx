"use client"

import { useState } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, RotateCcw, Settings as SettingsIcon } from "lucide-react"

import { GeneralSettings } from "@/components/settings/general-settings"
import { AITemplatesSettings } from "@/components/settings/ai-templates-settings"
import { ReportSettings } from "@/components/settings/report-settings"
import { FunnelSettings } from "@/components/settings/funnel-settings"
import { LeadsDealsSettings } from "@/components/settings/leads-deals-settings"
import { PaymentSettings } from "@/components/settings/payment-settings"
import { IndustrySettings } from "@/components/settings/industry-settings"
import { IntegrationSettings } from "@/components/settings/integration-settings"
import { SystemSettings } from "@/components/settings/system-settings"

const tabs = [
  { id: "general", label: "General" },
  { id: "ai", label: "AI & Templates" },
  { id: "reports", label: "Reports" },
  { id: "funnels", label: "Funnels" },
  { id: "leads", label: "Leads & Deals" },
  { id: "payments", label: "Payments" },
  { id: "industries", label: "Industries" },
  { id: "integrations", label: "Integrations" },
  { id: "system", label: "System" },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const handleSave = () => {
    console.log("Saving settings...")
    setHasUnsavedChanges(false)
  }

  const handleReset = () => {
    const ok = confirm("Discard all unsaved changes?")
    if (!ok) return
    setHasUnsavedChanges(false)
  }

  return (
    <div className="p-6 space-y-6 text-white">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <SettingsIcon size={18} className="text-cyan-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-sm text-zinc-500">
              Configure automation, AI behavior, funnels and system logic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}

          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-40"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* TABS WRAPPER */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

        {/* SCROLLABLE TAB BAR */}
        <div className="overflow-x-auto">
          <TabsList className="flex w-max gap-2 bg-white/5 border border-white/10 p-1 rounded-xl">

            {tabs.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="px-4 py-2 rounded-lg text-sm data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
              >
                {t.label}
              </TabsTrigger>
            ))}

          </TabsList>
        </div>

        {/* CONTENT PANELS */}
        <div className="space-y-6">

          <TabsContent value="general">
            <SettingsCard
              title="General Platform Settings"
              desc="Core configuration for system behavior and global defaults"
            >
              <GeneralSettings onChanged={() => setHasUnsavedChanges(true)} />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="ai">
            <SettingsCard
              title="AI Configuration"
              desc="Control prompts, templates, and automation intelligence"
            >
              <AITemplatesSettings onChanged={() => setHasUnsavedChanges(true)} />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="reports">
            <SettingsCard
              title="Report Engine"
              desc="Define generation rules, pricing logic and automation layers"
            >
              <ReportSettings onChanged={() => setHasUnsavedChanges(true)} />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="funnels">
            <SettingsCard
              title="Funnels & Landing Systems"
              desc="Control acquisition flows and conversion structures"
            >
              <FunnelSettings onChanged={() => setHasUnsavedChanges(true)} />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="leads">
            <SettingsCard
              title="Leads & Deal Logic"
              desc="Automation rules for lead creation and assignment"
            >
              <LeadsDealsSettings onChanged={() => setHasUnsavedChanges(true)} />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="payments">
            <SettingsCard
              title="Monetization Settings"
              desc="Pricing, billing rules and payment integrations"
            >
              <PaymentSettings onChanged={() => setHasUnsavedChanges(true)} />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="industries">
            <SettingsCard
              title="Industry Intelligence"
              desc="Adjust AI outputs per vertical for higher accuracy"
            >
              <IndustrySettings onChanged={() => setHasUnsavedChanges(true)} />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="integrations">
            <SettingsCard
              title="External Integrations"
              desc="APIs, webhooks and third-party system connections"
            >
              <IntegrationSettings onChanged={() => setHasUnsavedChanges(true)} />
            </SettingsCard>
          </TabsContent>

          <TabsContent value="system">
            <SettingsCard
              title="System & Infrastructure"
              desc="Logs, backups, alerts and performance configuration"
            >
              <SystemSettings onChanged={() => setHasUnsavedChanges(true)} />
            </SettingsCard>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  )
}

/* ---------------- UI WRAPPER ---------------- */

function SettingsCard({
  title,
  desc,
  children,
}: {
  title: string
  desc: string
  children: React.ReactNode
}) {
  return (
    <Card className="bg-white/5 border border-white/10 text-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-zinc-500">
          {desc}
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}