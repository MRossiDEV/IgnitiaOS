"use client";

// ======================================================
// Admin: Automation — Workflow List
// app/admin/automation/page.tsx
// ======================================================
// Lists/creates workflows via the existing, already-wired
// /api/v1/automation/workflows endpoints, linking through to
// the canvas editor at /admin/automation/[id]. Edit/Delete and
// category are metadata-only operations — they never touch a
// workflow's nodes/edges (see WorkflowService.save()'s optional
// nodes/edges, fixed alongside this so a metadata-only PUT can't
// wipe the canvas.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface WorkflowSummary {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  status: string;
  updated_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  paused: "bg-amber-400/15 text-amber-300 border-amber-400/20",
};

export default function AutomationListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", category: "" });
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/v1/automation/workflows")
      .then((r) => r.json())
      .then((data) => setWorkflows(data.workflows ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const categories = useMemo(
    () => Array.from(new Set(workflows.map((w) => w.category).filter((c): c is string => !!c))).sort(),
    [workflows]
  );

  const visibleWorkflows = categoryFilter ? workflows.filter((w) => w.category === categoryFilter) : workflows;

  const createWorkflow = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/v1/automation/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.workflow?.id) router.push(`/admin/automation/${data.workflow.id}`);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (wf: WorkflowSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditError(null);
    setEditingId(wf.id);
    setEditForm({ name: wf.name, description: wf.description ?? "", category: wf.category ?? "" });
  };

  const cancelEdit = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingId(null);
    setEditError(null);
  };

  const saveEdit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editForm.name.trim()) return;
    setSaving(true);
    setEditError(null);
    try {
      const res = await fetch(`/api/v1/automation/workflows/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          category: editForm.category.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setEditingId(null);
        load();
      } else {
        setEditError(data.error ?? "Failed to save changes.");
      }
    } catch (err: any) {
      setEditError(err.message ?? "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const deleteWorkflow = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    setDeletingId(id);
    setListError(null);
    try {
      const res = await fetch(`/api/v1/automation/workflows/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) load();
      else setListError(data.error ?? "Failed to delete workflow.");
    } catch (err: any) {
      setListError(err.message ?? "Failed to delete workflow.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-full bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Automation</h1>
              <p className="text-sm text-zinc-500">Build and run workflows from a node canvas.</p>
            </div>
          </div>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-2 text-sm rounded-md bg-white/5 border border-white/10 text-white"
            >
              <option value="" className="bg-[#0d1117]">
                All categories
              </option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[#0d1117]">
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-6 flex items-center gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New workflow name"
            onKeyDown={(e) => e.key === "Enter" && createWorkflow()}
            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500/40"
          />
          <Button
            onClick={createWorkflow}
            disabled={creating || !newName.trim()}
            className="gap-1.5 bg-cyan-500 text-black font-semibold hover:bg-cyan-400 whitespace-nowrap"
          >
            <Plus size={16} />
            {creating ? "Creating..." : "New Workflow"}
          </Button>
        </div>

        {listError && <p className="text-sm text-red-400 mb-3">{listError}</p>}

        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : visibleWorkflows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
            <p className="text-sm text-zinc-500">
              {categoryFilter ? "No workflows in this category." : "No workflows yet — create one above."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleWorkflows.map((wf) =>
              editingId === wf.id ? (
                <div key={wf.id} className="rounded-xl border border-cyan-500/30 bg-white/[0.03] p-4 space-y-2.5">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Workflow name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                  />
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description (optional)"
                    rows={2}
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                  />
                  <Input
                    value={editForm.category}
                    onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="Category (optional) — e.g. Intelligence, CRM, Marketing"
                    list="workflow-categories"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                  />
                  <datalist id="workflow-categories">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                  {editError && <p className="text-xs text-red-400">{editError}</p>}
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      onClick={cancelEdit}
                      className="gap-1.5 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <X size={14} />
                      Cancel
                    </Button>
                    <Button
                      onClick={(e) => saveEdit(wf.id, e)}
                      disabled={saving || !editForm.name.trim()}
                      className="gap-1.5 bg-cyan-500 text-black font-semibold hover:bg-cyan-400"
                    >
                      <Check size={14} />
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  key={wf.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between cursor-pointer hover:border-cyan-500/30 hover:bg-white/[0.05] transition-colors"
                  onClick={() => router.push(`/admin/automation/${wf.id}`)}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{wf.name}</p>
                      {wf.category && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 shrink-0">
                          {wf.category}
                        </span>
                      )}
                    </div>
                    {wf.description && <p className="text-sm text-zinc-500 truncate">{wf.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[wf.status] ?? STATUS_STYLES.draft}`}
                    >
                      {wf.status}
                    </span>
                    <span className="text-xs text-zinc-500 hidden sm:inline">
                      updated {new Date(wf.updated_at).toLocaleString()}
                    </span>
                    <button
                      onClick={(e) => startEdit(wf, e)}
                      title="Edit name/description/category"
                      className="rounded-md p-1.5 text-zinc-500 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => deleteWorkflow(wf.id, wf.name, e)}
                      disabled={deletingId === wf.id}
                      title="Delete workflow"
                      className="rounded-md p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-colors disabled:opacity-60"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
