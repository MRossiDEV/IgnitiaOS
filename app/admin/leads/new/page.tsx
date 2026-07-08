"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  Globe,
  Building2,
  Briefcase,
  Target,
  DollarSign,
  FileText,
  Tag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type LeadForm = {
    name: string
    last_name: string
  company: string
  industry: string
  job_title: string

  email: string
  phone: string
  website: string
  country: string
  city: string

  source: string
  source_detail: string

  status: string
  priority: string
  estimated_value: number | ""

  budget: number | ""
  timeline: string

  notes: string
}

export default function NewLeadPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<LeadForm>({
      name: "",
    last_name: "",
    company: "",
    industry: "",
    job_title: "",

    email: "",
    phone: "",
    website: "",
    country: "",
    city: "",

    source: "manual",
    source_detail: "",

    status: "new",
    priority: "medium",
    estimated_value: "",

    budget: "",
    timeline: "unknown",

    notes: "",
  })

  function update<K extends keyof LeadForm>(key: K, value: LeadForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    try {
      setSaving(true)

      const payload = {
        ...form,
        estimated_value: form.estimated_value === "" ? null : Number(form.estimated_value),
        budget: form.budget === "" ? null : Number(form.budget),
      }

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create lead")
      }

      router.push("/admin/leads")
    } catch (err) {
      console.error(err)
      alert("Failed to create lead")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-white">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button className="text-black"
            variant="outline"
            onClick={() => router.push("/admin/leads")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div>
            <h1 className="text-3xl font-bold">Create New Lead</h1>
            <p className="text-zinc-500 text-sm">
              Manually add a high-quality lead to your pipeline
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-cyan-500 text-black hover:bg-cyan-400"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Lead
        </Button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT - MAIN INFO */}
        <div className="lg:col-span-2 space-y-6">

          {/* BASIC INFO */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <Input placeholder="Name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                          />
                          
              <Input placeholder="Last Name"
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Company"
                  value={form.company}
                  onChange={(e) => update("company", e.target.value)}
                />
                <Input placeholder="Industry"
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                />
              </div>

              <Input placeholder="Job Title"
                value={form.job_title}
                onChange={(e) => update("job_title", e.target.value)}
              />

            </CardContent>
          </Card>

          {/* CONTACT */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Mail className="w-4 h-4" />
                Contact Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <Input placeholder="Email *"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
                <Input placeholder="Website"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                />
                <Input placeholder="City"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                />
              </div>

            </CardContent>
          </Card>

          {/* NOTES */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-4 h-4" />
                Notes
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Textarea
                placeholder="Add manual notes about this lead..."
                className="min-h-[140px]"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </CardContent>
          </Card>

        </div>

        {/* RIGHT - QUALIFICATION */}
        <div className="space-y-6">

          {/* STATUS */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Qualification</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <Select
                value={form.source}
                onValueChange={(v) => update("source", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                  <SelectItem value="ad_campaign">Ad Campaign</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Source Detail"
                value={form.source_detail}
                onChange={(e) => update("source_detail", e.target.value)}
              />

              <Select
                value={form.status}
                onValueChange={(v) => update("status", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={form.priority}
                onValueChange={(v) => update("priority", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Estimated Value"
                value={form.estimated_value}
                onChange={(e) => update("estimated_value", e.target.value as any)}
              />

              <Input
                type="number"
                placeholder="Budget"
                value={form.budget}
                onChange={(e) => update("budget", e.target.value as any)}
              />

              <Select
                value={form.timeline}
                onValueChange={(v) => update("timeline", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="30_days">30 Days</SelectItem>
                  <SelectItem value="90_days">90 Days</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}