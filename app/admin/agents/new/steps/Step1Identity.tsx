"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import {
  Bot,
  Globe,
  Search,
  PenTool,
  Shield,
  DollarSign,
  Database,
  Brain,
  FileSearch,
  Building2,
  Megaphone,
  Upload,
  X,
  Loader2,
} from "lucide-react";

interface Props {
  agent: AgentDefinition;
  setAgent: Dispatch<SetStateAction<AgentDefinition>>;
}

interface AgentDefinition {
    name: string;
    description: string;
    category: string;
    model: string;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
    status: string;
    avatar: string;
    provider?: string;
    slug?: string;
    version?: string;
    emoji?: string;
    created_at?: string;
    icon?: string;
    visibility?: "private" | "internal" | "public";
}

const categories = [
  {
    name: "Research",
    icon: Search,
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    name: "SEO",
    icon: Globe,
    color: "bg-green-500/20 text-green-400",
  },
  {
    name: "Sales",
    icon: DollarSign,
    color: "bg-emerald-500/20 text-emerald-400",
  },
  {
    name: "Marketing",
    icon: Megaphone,
    color: "bg-pink-500/20 text-pink-400",
  },
  {
    name: "Security",
    icon: Shield,
    color: "bg-red-500/20 text-red-400",
  },
  {
    name: "Database",
    icon: Database,
    color: "bg-yellow-500/20 text-yellow-400",
  },
  {
    name: "Branding",
    icon: PenTool,
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    name: "AI",
    icon: Brain,
    color: "bg-cyan-500/20 text-cyan-400",
  },
  {
    name: "Audit",
    icon: FileSearch,
    color: "bg-orange-500/20 text-orange-400",
  },
  {
    name: "Business",
    icon: Building2,
    color: "bg-indigo-500/20 text-indigo-400",
  },
];


export default function Step1Identity({
  agent,
  setAgent,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Auto-generate slug from name
  useEffect(() => {
    const slug = agent.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setAgent((prev) => ({
      ...prev,
      slug,
    }));
  }, [agent.name]);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      const form = new FormData()
      form.append("file", file)

      const res = await fetch("/api/v1/agents/avatar", { method: "POST", body: form })
      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Upload failed.")
      }

      setAgent((prev) => ({ ...prev, avatar: json.url }))
    } catch (err: any) {
      setUploadError(err?.message ?? "Upload failed.")
      if (fileInputRef.current) fileInputRef.current.value = ""
    } finally {
      setUploading(false)
    }
  }

  function clearAvatar() {
    setAgent((prev) => ({ ...prev, avatar: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>

        <div className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
          Step 1
        </div>

        <h2 className="mt-5 text-3xl font-bold">
          Agent Identity
        </h2>

        <p className="mt-3 max-w-3xl text-sm text-zinc-400">
          Every AI Worker has its own identity, purpose and
          specialization. This information is displayed throughout
          Ignitia OS.
        </p>

      </div>

      {/* GRID */}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

        {/* LEFT */}

        <div className="space-y-8">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

            <label className="text-sm font-semibold text-zinc-400">
              Agent Name
            </label>

            <input
              value={agent.name}
              onChange={(e) =>
                setAgent((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Website Auditor"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 text-xl outline-none transition focus:border-cyan-500"
            />

            <div className="mt-8">

              <label className="text-sm font-semibold text-zinc-400">
                Description
              </label>

              <textarea
                rows={5}
                value={agent.description}
                onChange={(e) =>
                  setAgent((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe what this AI worker does..."
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 p-5 outline-none transition focus:border-cyan-500"
              />

            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">

              <div>

                <label className="text-sm font-semibold text-zinc-400">
                  Slug
                </label>

                <input
                  value={agent.slug}
                  readOnly
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-zinc-400"
                />

              </div>

              <div>

                <label className="text-sm font-semibold text-zinc-400">
                  Version
                </label>

                <input
                  value={agent.version}
                  onChange={(e) =>
                    setAgent((prev) => ({
                      ...prev,
                      version: e.target.value,
                    }))
                  }
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-5 py-4 outline-none focus:border-cyan-500"
                />

              </div>

            </div>

          </div>

          {/* CATEGORY */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

            <h3 className="text-2xl font-bold">
              Category
            </h3>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {categories.map((cat) => {
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.name}
                    onClick={() =>
                      setAgent((prev) => ({
                        ...prev,
                        category: cat.name,
                      }))
                    }
                    className={`rounded-2xl border p-5 transition ${
                      agent.category === cat.name
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${cat.color}`}
                    >
                      <Icon size={22} />
                    </div>

                    <div className="text-left font-semibold">
                      {cat.name}
                    </div>

                  </button>
                );
              })}

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="space-y-8">

          {/* AVATAR UPLOAD */}

          <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/10 to-transparent p-8">

            <h3 className="text-2xl font-bold">Agent Avatar</h3>

            <p className="mt-2 text-sm text-zinc-400">
              Upload a custom image, or keep the default icon.
            </p>

            {/* Preview + upload control */}
            <div className="mt-6 flex flex-col items-center gap-5">

              {/* Avatar preview */}
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-cyan-500/10">
                {uploading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
                ) : agent.avatar ? (
                  <>
                    <img
                      src={agent.avatar}
                      alt="Agent avatar"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={clearAvatar}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600 transition"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <Bot className="h-14 w-14 text-cyan-400" />
                )}
              </div>

              {/* Upload button */}
              <button
                onClick={() => !uploading && fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition hover:border-cyan-500 hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Uploading…" : agent.avatar ? "Change Image" : "Upload Image"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarUpload}
              />

              {uploadError && (
                <p className="text-center text-xs text-red-400">{uploadError}</p>
              )}

              <p className="text-center text-xs text-zinc-500">
                PNG, JPG or WebP · max 5 MB · recommended 256×256 px
              </p>

            </div>

          </div>

          {/* VISIBILITY */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

            <h3 className="text-2xl font-bold">
              Visibility
            </h3>

            <div className="mt-6 space-y-3">

              {["private", "internal", "public"].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setAgent((prev) => ({
                      ...prev,
                      visibility: item as any,
                    }))
                  }
                  className={`w-full rounded-2xl border p-5 text-left capitalize transition ${
                    agent.visibility === item
                      ? "border-cyan-500 bg-cyan-500/10"
                      : "border-white/10"
                  }`}
                >
                  {item}
                </button>
              ))}

            </div>

          </div>

          {/* LIVE PREVIEW */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">

            <h3 className="text-2xl font-bold">
              Live Preview
            </h3>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-8">

              <div className="flex items-center gap-5">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cyan-500/10">
                  {agent.avatar ? (
                    <img
                      src={agent.avatar}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Bot className="h-10 w-10 text-cyan-400" />
                  )}
                </div>

                <div>

                  <h2 className="text-2xl font-black">
                    {agent.name || "Unnamed Agent"}
                  </h2>

                  <p className="mt-2 text-zinc-500">
                    {agent.description || "Agent description..."}
                  </p>

                </div>

              </div>

              <div className="mt-8 flex flex-wrap gap-3">

                <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
                  {agent.category || "No Category"}
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-sm">
                  {agent.version}
                </span>

                <span className="rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-400">
                  {agent.visibility}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}