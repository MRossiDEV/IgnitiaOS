"use client";

// ======================================================
// HtmlPreview — live "what the recipient sees" renderer
// components/admin/html-preview.tsx
// ======================================================
// Renders raw HTML in a fully sandboxed iframe (no scripts, no same-origin)
// so it displays like an email client would, safely. Used by the email
// composer and template editor to preview body_html live as you type.

interface HtmlPreviewProps {
  html: string;
  subject?: string;
  className?: string;
  height?: number;
}

const EMPTY_STATE =
  "<div style=\"font-family:system-ui,sans-serif;color:#9ca3af;padding:24px;font-size:14px\">Nothing to preview yet. Start typing HTML in the body field.</div>";

export function HtmlPreview({
  html,
  subject,
  className,
  height = 420,
}: HtmlPreviewProps) {
  return (
    <div className={`overflow-hidden rounded-md border bg-white ${className ?? ""}`}>
      {subject !== undefined && (
        <div className="border-b bg-muted px-3 py-2 text-xs">
          <span className="text-muted-foreground">Subject: </span>
          <span className="font-medium text-foreground">
            {subject || "(no subject)"}
          </span>
        </div>
      )}
      <iframe
        title="Email preview"
        sandbox=""
        srcDoc={html?.trim() ? html : EMPTY_STATE}
        className="w-full bg-white"
        style={{ height }}
      />
    </div>
  );
}
