"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  Lock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { MetricCard } from "@/components/ui/metric-card"
import { SecurityToggle } from "@/components/ui/security-toggle"

const getRoleColor = (role?: string) => {
  const map: Record<string, string> = {
    super_admin: "bg-red-500/10 text-red-300 border-red-500/20",
    admin: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    manager: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    sales: "bg-green-500/10 text-green-300 border-green-500/20",
    agent: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    partner: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    contractor: "bg-orange-500/10 text-orange-300 border-orange-500/20",
    client: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
    user: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  }

  return map[role ?? "user"] ?? map.user
}

const getStatusColor = (status?: string) => {
  const map: Record<string, string> = {
    active: "bg-green-500/10 text-green-300 border-green-500/20",
    inactive: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
    suspended: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    pending: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    deleted: "bg-red-500/10 text-red-300 border-red-500/20",
  }

  return map[status ?? "active"] ?? map.active
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<any>({
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "user",
    status: "active",
    job_title: "",
    department: "",
    timezone: "",
    locale: "",
    notes: "",
    is_active: true,
    email_verified: false,
    two_factor_enabled: false,
  })

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/users/${params.id}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data?.error)

      const user = data.user

      setForm({
        ...form,
        ...user,
      })
    } catch (err) {
      console.error("loadUser error:", err)
    } finally {
      setLoading(false)
    }
  }

  async function saveUser() {
    try {
      setSaving(true)

      const response = await fetch(
        `/api/admin/users?id=${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      )

      if (!response.ok) throw new Error("Failed to update user")

      router.push("/admin/users")
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    )
  }

  const fullName =
    [form.first_name, form.last_name].filter(Boolean).join(" ") || "—"

  return (
    <div className="min-h-screen p-6 bg-zinc-950 text-white space-y-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div className="flex items-center gap-5">

            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl font-bold">
              {form.first_name?.charAt(0)}
              {form.last_name?.charAt(0)}
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {fullName}
              </h1>

              <p className="text-zinc-400">
                {form.job_title || "No Job Title"}
              </p>

              <div className="flex gap-2 mt-3 flex-wrap">

                <span className={`px-3 py-1 rounded-full text-xs border ${getRoleColor(form.role)}`}>
                  {form.role}
                </span>

                <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(form.status)}`}>
                  {form.status}
                </span>

              </div>
            </div>

          </div>

          <div className="flex gap-3">

            <Button
              variant="outline"
              className="border-white/10 bg-white/5"
              onClick={() => router.push("/admin/users")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={saveUser}
              disabled={saving}
              className="bg-cyan-500 text-black hover:bg-cyan-400"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>

          </div>

        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <MetricCard
          title="Email Verified"
          value={form.email_verified ? "YES" : "NO"}
          icon={<CheckCircle className="h-5 w-5" />}
        />

        <MetricCard
          title="2FA"
          value={form.two_factor_enabled ? "YES" : "NO"}
          icon={<Lock className="h-5 w-5" />}
        />

        <MetricCard
          title="Role"
          value={form.role}
          icon={<Shield className="h-5 w-5" />}
        />

        <MetricCard
          title="Status"
          value={form.status}
          icon={<User className="h-5 w-5" />}
        />

      </div>

      {/* SECURITY */}
      <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            Security
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          <SecurityToggle
            title="Account Enabled"
            description="User can access platform"
            checked={form.is_active}
            onCheckedChange={(v) =>
              setForm({ ...form, is_active: v })
            }
          />

          <SecurityToggle
            title="Email Verified"
            description="Email validation status"
            checked={form.email_verified}
            onCheckedChange={(v) =>
              setForm({ ...form, email_verified: v })
            }
          />

          <SecurityToggle
            title="Two Factor Authentication"
            description="Extra login security layer"
            checked={form.two_factor_enabled}
            onCheckedChange={(v) =>
              setForm({ ...form, two_factor_enabled: v })
            }
          />

        </CardContent>
      </Card>

      {/* ROLE INFO */}
      <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Role Intelligence</CardTitle>
        </CardHeader>

        <CardContent className="text-sm text-zinc-400 space-y-2">

          {form.role === "super_admin" && <p>Full system access.</p>}
          {form.role === "admin" && <p>Organization management access.</p>}
          {form.role === "manager" && <p>Team management tools.</p>}
          {form.role === "sales" && <p>CRM and lead management.</p>}
          {form.role === "partner" && <p>Partner dashboard access.</p>}
          {form.role === "client" && <p>Limited client portal access.</p>}

        </CardContent>
      </Card>

      {/* INFO */}
      <Card className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">

          <div className="flex justify-between">
            <span className="text-zinc-400">Full Name</span>
            <span>{fullName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Email</span>
            <span>{form.email}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Phone</span>
            <span>{form.phone}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Job</span>
            <span>{form.job_title}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-400">Department</span>
            <span>{form.department}</span>
          </div>

        </CardContent>
      </Card>

      {/* DANGER */}
      <Card className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-red-400">
            Dangerous Actions
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">

          <Button className="w-full border-white/10 bg-white/5">
            Reset Password
          </Button>

          <Button className="w-full border-white/10 bg-white/5">
            Force Logout
          </Button>

          <Button className="w-full bg-red-500 hover:bg-red-400 text-black">
            Suspend User
          </Button>

          <Button className="w-full bg-red-500 hover:bg-red-400 text-black">
            Delete User
          </Button>

        </CardContent>
      </Card>

    </div>
  )
}