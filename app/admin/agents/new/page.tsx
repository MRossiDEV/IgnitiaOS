"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import {
  Save,
  Play,
  ArrowLeft,
  Check,
} from "lucide-react"

import Link from "next/link"

import { Button } from "@/components/ui/button"
import Step1Identity from "./steps/Step1Identity"
import Step2Brain from "./steps/Step2Brain"
import Step3Tools from "./steps/Step3Tools"
import Step4Workflow from "./steps/Step4Workflow"

interface AgentDefinition {
  name: string
  description: string
  category: string
  model: string
  system_prompt: string
  temperature: number
  max_tokens: number
  status: string
  avatar: string
  provider?: string
  slug?: string
  version?: string
  emoji?: string
  created_at?: string
  icon?: string
  visibility?: "private" | "internal" | "public"
  reasoning?: "low" | "medium" | "high"
  response_format?: "Markdown" | "JSON" | "HTML" | "Plain Text"
  personality_preset?: "analyst" | "consultant" | "engineer" | "marketing"
  tools: string[]
  tool_configs?: Record<
    string,
    {
      timeout?: number
      retries?: number
      rate_limit?: string
      api_key?: string
      config_json?: string
    }
  >
  workflow?: any[]
}

const wizardSteps = [
  {
    id: 1,
    title: "Identity",
    description: "Name, category and profile",
  },
  {
    id: 2,
    title: "Brain",
    description: "Provider and model settings",
  },
  {
    id: 3,
    title: "Tools",
    description: "Install capabilities",
  },
  {
    id: 4,
    title: "Workflow",
    description: "Build execution graph",
  },
]

export default function NewAgentPage() {
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(1)

  const [agent, setAgent] = useState<AgentDefinition>({
    name: "",
    description: "",
    category: "",
    model: "gpt-5",
    system_prompt: "",
    temperature: 0.7,
    max_tokens: 4000,
    status: "active",
    avatar: "",
    provider: "openai",
    slug: "",
    version: "1.0.0",
    emoji: "🤖",
    visibility: "internal",
    reasoning: "medium",
    response_format: "Markdown",
    personality_preset: "analyst",
    tools: [],
    tool_configs: {},
    workflow: [],
  })

  const isLastStep = step === wizardSteps.length

  const [saveError, setSaveError] = useState<string | null>(null)

  function nextStep() {
    setStep((current) => Math.min(current + 1, wizardSteps.length))
  }

  function prevStep() {
    setStep((current) => Math.max(current - 1, 1))
  }

  function renderStep() {
    if (step === 1) {
      return <Step1Identity agent={agent as any} setAgent={setAgent as any} />
    }

    if (step === 2) {
      return <Step2Brain agent={agent as any} setAgent={setAgent as any} />
    }

    if (step === 3) {
      return <Step3Tools agent={agent as any} setAgent={setAgent as any} />
    }

    return (
      <Step4Workflow
        agent={agent as any}
        setAgent={setAgent as any}
        onSave={saveAgent}
        saving={saving}
      />
    )
  }

  async function saveAgent() {
    const trimmedName = agent.name.trim()
    const trimmedDescription = agent.description.trim()

    if (!trimmedName) {
      setSaveError("Agent name is required before saving.")
      return
    }

    try {
      setSaving(true)
      setSaveError(null)

      const payload = {
        name:               trimmedName,
        description:        trimmedDescription,
        category:           agent.category,
        model:              agent.model,
        system_prompt:      agent.system_prompt,
        temperature:        agent.temperature,
        max_tokens:         agent.max_tokens,
        status:             agent.status,
        avatar:             agent.avatar,
        slug:               agent.slug,
        version:            agent.version,
        provider:           agent.provider,
        reasoning:          agent.reasoning,
        response_format:    agent.response_format,
        visibility:         agent.visibility,
        tools:              agent.tools,
        tool_configs:       agent.tool_configs,
        workflow:           agent.workflow,
        personality_preset: agent.personality_preset,
      }

      const res = await fetch("/api/v1/agents/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Failed to save agent.")
      }

      router.push("/admin/agents")
    } catch (err: any) {
      const message = err?.message ?? "Failed to save agent."
      setSaveError(message)
      console.error("SAVE AGENT ERROR:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/agents">
            <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <div>
            <h1 className="text-3xl font-bold">Create AI Agent</h1>
            <p className="text-zinc-500 text-sm mt-1">
              Build and configure a production-ready AI agent
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-transparent border-white/10 hover:bg-white/10"
          >
            <Play className="w-4 h-4 mr-2" />
            Test
          </Button>

          <Button
            onClick={saveAgent}
            disabled={saving}
            className="bg-cyan-500 text-black hover:bg-cyan-400"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Agent"}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {saveError}
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-2 md:grid-cols-4">
          {wizardSteps.map((wizardStep) => {
            const active = step === wizardStep.id
            const complete = step > wizardStep.id

            return (
              <button
                key={wizardStep.id}
                onClick={() => setStep(wizardStep.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-cyan-500 bg-cyan-500/10"
                    : complete
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Step {wizardStep.id}
                  </span>

                  {complete && (
                    <Check className="h-4 w-4 text-emerald-400" />
                  )}
                </div>

                <div className="mt-2 text-base font-semibold">
                  {wizardStep.title}
                </div>

                <p className="mt-1 text-xs text-zinc-500">
                  {wizardStep.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {renderStep()}

      <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-zinc-500">
          Step {step} of {wizardSteps.length}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
            onClick={prevStep}
            disabled={step === 1 || saving}
          >
            Previous
          </Button>

          {isLastStep ? (
            <Button
              onClick={saveAgent}
              disabled={saving}
              className="bg-cyan-500 text-black hover:bg-cyan-400"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Agent"}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="bg-cyan-500 text-black hover:bg-cyan-400"
              disabled={saving}
            >
              Next Step
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}