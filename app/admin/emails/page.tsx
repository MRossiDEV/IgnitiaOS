"use client";

// ======================================================
// Admin: Emails
// app/admin/emails/page.tsx
// ======================================================
// Compose-and-send, reusable templates, and sent history.
// Components only render/capture input/call actions — all
// business logic lives behind the /api/v1/emails/* routes.
//
// ASSUMPTIONS (adjust if wrong for your setup):
// - Imports from "@/components/ui/*" assume shadcn/ui
//   components: button, input, textarea, label, tabs, card,
//   table, dialog, badge. If any path differs in your repo,
//   just fix the import — the component usage itself is
//   standard shadcn API (Tabs/TabsList/TabsTrigger/
//   TabsContent, Dialog/DialogContent/DialogHeader/
//   DialogTitle/DialogFooter, etc.)
// - Body is a plain HTML textarea (no rich text editor).
//   Swap in something like Tiptap later if you want WYSIWYG.
// - "sentBy" isn't wired to a real logged-in admin user yet
//   since I don't know your auth/session shape — currently
//   left blank. Wire it once you tell me how to read the
//   current admin user.

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

// ------------------------------------------------------
// Types
// ------------------------------------------------------

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  updated_at: string;
}

interface LeadOption {
  reportId: string;
  fullName: string;
  email: string;
  businessName: string;
}

interface EmailLog {
  id: string;
  to_email: string;
  to_name: string | null;
  subject: string;
  status: "sent" | "failed";
  error: string | null;
  sent_at: string;
}

// ------------------------------------------------------
// Page
// ------------------------------------------------------

export default function EmailsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Emails</h1>
        <p className="text-muted-foreground text-sm">
          Compose and send emails as the company, reuse templates, and
          review what's already been sent.
        </p>
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <ComposeTab />
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ------------------------------------------------------
// Compose Tab
// ------------------------------------------------------

function ComposeTab() {
  const [recipientMode, setRecipientMode] = useState<"manual" | "lead">(
    "manual"
  );
  const [manualEmail, setManualEmail] = useState("");
  const [manualName, setManualName] = useState("");

  const [leadQuery, setLeadQuery] = useState("");
  const [leadResults, setLeadResults] = useState<LeadOption[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadOption | null>(null);

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/v1/emails/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates ?? []))
      .catch(() => {});
  }, []);

  // Simple debounce for the lead search.
  useEffect(() => {
    if (recipientMode !== "lead" || leadQuery.trim().length < 2) {
      setLeadResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`/api/v1/emails/leads?q=${encodeURIComponent(leadQuery)}`)
        .then((r) => r.json())
        .then((data) => setLeadResults(data.leads ?? []))
        .catch(() => setLeadResults([]));
    }, 300);

    return () => clearTimeout(timeout);
  }, [leadQuery, recipientMode]);

  const applyTemplate = useCallback(
    (templateId: string) => {
      setSelectedTemplateId(templateId);
      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setSubject(template.subject);
        setBodyHtml(template.body_html);
      }
    },
    [templates]
  );

  const resetForm = () => {
    setManualEmail("");
    setManualName("");
    setSelectedLead(null);
    setLeadQuery("");
    setSelectedTemplateId("");
    setSubject("");
    setBodyHtml("");
    setSaveAsTemplate(false);
    setNewTemplateName("");
  };

  const handleSend = async () => {
    setFeedback(null);

    const to = recipientMode === "manual" ? manualEmail : selectedLead?.email;
    const toName =
      recipientMode === "manual" ? manualName : selectedLead?.fullName;
    const reportId =
      recipientMode === "lead" ? selectedLead?.reportId : undefined;

    if (!to || !subject || !bodyHtml) {
      setFeedback({
        type: "error",
        message: "Recipient, subject, and body are all required.",
      });
      return;
    }

    setSending(true);

    try {
      let templateId = selectedTemplateId || undefined;

      if (saveAsTemplate && newTemplateName) {
        const templateRes = await fetch("/api/v1/emails/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newTemplateName,
            subject,
            bodyHtml,
          }),
        });
        const templateData = await templateRes.json();
        if (!templateRes.ok) throw new Error(templateData.error);
        templateId = templateData.template.id;
        setTemplates((prev) => [templateData.template, ...prev]);
      }

      const sendRes = await fetch("/api/v1/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          toName,
          subject,
          bodyHtml,
          templateId,
          reportId,
        }),
      });

      const sendData = await sendRes.json();
      if (!sendRes.ok) throw new Error(sendData.error);

      setFeedback({ type: "success", message: `Sent to ${to}.` });
      resetForm();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message ?? "Failed to send email.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardContent className="pt-6 space-y-5">
        {/* Recipient */}
        <div className="space-y-2">
          <Label>Recipient</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={recipientMode === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => setRecipientMode("manual")}
            >
              Manual
            </Button>
            <Button
              type="button"
              variant={recipientMode === "lead" ? "default" : "outline"}
              size="sm"
              onClick={() => setRecipientMode("lead")}
            >
              From Leads
            </Button>
          </div>

          {recipientMode === "manual" ? (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Input
                placeholder="Email address"
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
              />
              <Input
                placeholder="Name (optional)"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <Input
                placeholder="Search leads by name, email, or business..."
                value={leadQuery}
                onChange={(e) => setLeadQuery(e.target.value)}
              />
              {selectedLead ? (
                <div className="text-sm border rounded-md p-2 flex justify-between items-center">
                  <span>
                    {selectedLead.fullName} ({selectedLead.email}) —{" "}
                    {selectedLead.businessName}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLead(null)}
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                leadResults.length > 0 && (
                  <div className="border rounded-md divide-y">
                    {leadResults.map((lead) => (
                      <button
                        type="button"
                        key={lead.reportId}
                        className="w-full text-left p-2 text-sm hover:bg-muted"
                        onClick={() => {
                          setSelectedLead(lead);
                          setLeadResults([]);
                          setLeadQuery("");
                        }}
                      >
                        {lead.fullName} ({lead.email}) — {lead.businessName}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Template picker */}
        <div className="space-y-2">
          <Label>Start from a template (optional)</Label>
          <select
            className="w-full border rounded-md h-9 px-3 text-sm bg-background"
            value={selectedTemplateId}
            onChange={(e) => applyTemplate(e.target.value)}
          >
            <option value="">— None —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subject + Body */}
        <div className="space-y-2">
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Body (HTML)</Label>
          <Textarea
            rows={12}
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        {/* Save as template */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
            />
            Save this as a new template
          </label>
          {saveAsTemplate && (
            <Input
              placeholder="Template name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
            />
          )}
        </div>

        {feedback && (
          <p
            className={
              feedback.type === "success"
                ? "text-sm text-green-600"
                : "text-sm text-red-600"
            }
          >
            {feedback.message}
          </p>
        )}

        <Button onClick={handleSend} disabled={sending}>
          {sending ? "Sending..." : "Send Email"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------
// Templates Tab
// ------------------------------------------------------

function TemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [form, setForm] = useState({ name: "", subject: "", bodyHtml: "" });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/emails/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", subject: "", bodyHtml: "" });
    setDialogOpen(true);
  };

  const openEdit = (template: EmailTemplate) => {
    setEditing(template);
    setForm({
      name: template.name,
      subject: template.subject,
      bodyHtml: template.body_html,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    const path = editing
      ? `/api/v1/emails/templates/${editing.id}`
      : "/api/v1/emails/templates";
    const method = editing ? "PUT" : "POST";

    await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/v1/emails/templates/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>New Template</Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No templates yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.subject}</TableCell>
                    <TableCell>
                      {new Date(t.updated_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(t)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(t.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Subject</Label>
              <Input
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Body (HTML)</Label>
              <Textarea
                rows={10}
                className="font-mono text-sm"
                value={form.bodyHtml}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bodyHtml: e.target.value }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------------------------------------------
// History Tab
// ------------------------------------------------------

const PAGE_SIZE = 25;

function HistoryTab() {
  const [items, setItems] = useState<EmailLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/v1/emails/history?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`
    )
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Card className="mt-4">
      <CardContent className="pt-6 space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No emails sent yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sent</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.sent_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.to_name ? `${log.to_name} (${log.to_email})` : log.to_email}
                  </TableCell>
                  <TableCell>{log.subject}</TableCell>
                  <TableCell>
                    <Badge
                      variant={log.status === "sent" ? "default" : "destructive"}
                      title={log.error ?? undefined}
                    >
                      {log.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
