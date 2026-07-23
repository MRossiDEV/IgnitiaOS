// ======================================================
// Resolve Template
// lib/automation/resolveTemplate.ts
// ======================================================
// Same {{field}} substitution style as the email templates
// feature — replaces {{path.to.value}} with a value looked up
// from the upstream node's output context. No AI involved.

export function resolveTemplate(input: string, context: any): string {
  if (typeof input !== "string") return input;

  return input.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, path: string) => {
    const value = path
      .split(".")
      .reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), context);

    return value !== undefined && value !== null ? String(value) : "";
  });
}
