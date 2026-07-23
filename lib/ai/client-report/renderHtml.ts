// ======================================================
// Client Report — HTML template renderer
// lib/ai/client-report/renderHtml.ts
// ======================================================
// Produces a self-contained, print-optimized HTML document (inline CSS,
// system fonts, A4 page breaks) that Chromium renders to PDF. This is
// the visual design layer — deliberately polished, not a data dump.

import { ClientReportContent } from "./schema";

export interface ScorecardEntry {
  label: string;
  score: number;
}

export interface RenderMeta {
  businessName: string;
  website?: string;
  industry?: string;
  location?: string;
  overallScore: number;
  reportCode?: string;
  generatedDate: string; // preformatted date string
  scorecard: ScorecardEntry[];
  brandName?: string;
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Splits prose into <p> paragraphs on blank lines / newlines.
function paragraphs(text: string): string {
  return String(text ?? "")
    .split(/\n{1,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
}

function scoreColor(score: number): string {
  if (score >= 80) return "#10b981"; // emerald
  if (score >= 60) return "#06b6d4"; // cyan
  if (score >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Developing";
  return "Needs Attention";
}

function impactColor(impact: string): string {
  if (impact === "High") return "#ef4444";
  if (impact === "Medium") return "#f59e0b";
  return "#06b6d4";
}

export function renderClientReportHtml(
  content: ClientReportContent,
  meta: RenderMeta
): string {
  const brand = meta.brandName || "Ignitia";
  const overall = Math.round(meta.overallScore || 0);
  const ringColor = scoreColor(overall);

  const scorecardRows = meta.scorecard
    .map((entry) => {
      const c = scoreColor(entry.score);
      return `
        <div class="bar-row">
          <div class="bar-label">${esc(entry.label)}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${Math.max(
              4,
              Math.min(100, entry.score)
            )}%;background:${c};"></div>
          </div>
          <div class="bar-score" style="color:${c};">${entry.score}</div>
        </div>`;
    })
    .join("");

  const sectionPages = content.sections
    .map((section, i) => {
      const kp = section.keyPoints
        .map((p) => `<li>${esc(p)}</li>`)
        .join("");
      return `
        <section class="page section-page">
          <div class="section-index">${String(i + 1).padStart(2, "0")}</div>
          <h2 class="section-headline">${esc(section.headline)}</h2>
          <div class="rule"></div>
          <div class="section-body">${paragraphs(section.narrative)}</div>
          ${
            kp
              ? `<div class="keypoints"><div class="keypoints-title">Key takeaways</div><ul>${kp}</ul></div>`
              : ""
          }
        </section>`;
    })
    .join("");

  const priorityCards = content.priorities
    .map((p, i) => {
      const c = impactColor(p.impact);
      return `
        <div class="priority">
          <div class="priority-num">${i + 1}</div>
          <div class="priority-main">
            <div class="priority-head">
              <div class="priority-title">${esc(p.title)}</div>
              <div class="priority-badges">
                <span class="badge" style="background:${c}1a;color:${c};border-color:${c}40;">${esc(
                  p.impact
                )} impact</span>
                <span class="badge muted">${esc(p.timeframe)}</span>
              </div>
            </div>
            <p class="priority-why">${esc(p.rationale)}</p>
          </div>
        </div>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  :root {
    --ink: #0f172a;
    --muted: #64748b;
    --line: #e2e8f0;
    --accent: #06b6d4;
    --navy: #0b1220;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: var(--ink);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @page { size: A4; margin: 0; }
  .page {
    position: relative;
    width: 210mm;
    min-height: 297mm;
    padding: 22mm 20mm;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }
  p { line-height: 1.6; color: #1e293b; font-size: 11.5pt; margin-bottom: 8pt; }
  h1, h2, h3 { letter-spacing: -0.01em; }

  /* ---------- Cover ---------- */
  .cover {
    background: radial-gradient(120% 90% at 80% 10%, #123b4d 0%, var(--navy) 55%);
    color: #e6f6fb;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color-scheme: dark;
  }
  .cover .brand {
    font-size: 13pt; font-weight: 800; letter-spacing: 0.28em;
    text-transform: uppercase; color: var(--accent);
  }
  .cover-mid { margin-top: 8mm; }
  .cover .eyebrow {
    font-size: 10pt; letter-spacing: 0.22em; text-transform: uppercase;
    color: #7dd3fc; margin-bottom: 6mm;
  }
  .cover h1 {
    font-size: 34pt; line-height: 1.08; font-weight: 800; color: #ffffff;
    max-width: 150mm;
  }
  .cover .tagline {
    margin-top: 6mm; font-size: 13pt; color: #b6d9e6; max-width: 140mm; line-height: 1.5;
  }
  .cover-foot { display: flex; align-items: flex-end; justify-content: space-between; }
  .cover-meta { font-size: 10.5pt; color: #9fc4d3; line-height: 1.9; }
  .cover-meta b { color: #ffffff; font-weight: 600; }
  .ring {
    width: 46mm; height: 46mm; border-radius: 50%;
    background: conic-gradient(${ringColor} ${overall * 3.6}deg, rgba(255,255,255,0.12) 0deg);
    display: flex; align-items: center; justify-content: center;
  }
  .ring-inner {
    width: 37mm; height: 37mm; border-radius: 50%; background: var(--navy);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .ring-score { font-size: 26pt; font-weight: 800; color: #ffffff; line-height: 1; }
  .ring-cap { font-size: 8pt; letter-spacing: 0.16em; text-transform: uppercase; color: ${ringColor}; margin-top: 2mm; }

  /* ---------- Section headers / generic ---------- */
  .eyebrow-dark {
    font-size: 9.5pt; letter-spacing: 0.22em; text-transform: uppercase;
    color: var(--accent); font-weight: 700; margin-bottom: 4mm;
  }
  .rule { height: 3px; width: 22mm; background: var(--accent); border-radius: 2px; margin: 5mm 0 7mm; }
  .lead { font-size: 13pt; color: #0f172a; font-weight: 600; line-height: 1.5; margin-bottom: 6mm; }

  /* ---------- Executive summary ---------- */
  .verdict {
    background: #f0fbff; border: 1px solid #bde9f5; border-left: 4px solid var(--accent);
    padding: 6mm 7mm; border-radius: 6px; margin: 7mm 0; font-size: 12.5pt;
    color: #0c4a5e; font-weight: 600; line-height: 1.5;
  }

  /* ---------- Scorecard ---------- */
  .scorecard { margin-top: 4mm; }
  .bar-row { display: flex; align-items: center; gap: 6mm; margin-bottom: 6mm; }
  .bar-label { width: 42mm; font-size: 11pt; font-weight: 600; color: #0f172a; }
  .bar-track { flex: 1; height: 9px; background: #eef2f6; border-radius: 6px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 6px; }
  .bar-score { width: 12mm; text-align: right; font-weight: 800; font-size: 12pt; }

  /* ---------- Section pages ---------- */
  .section-page .section-index {
    font-size: 40pt; font-weight: 800; color: #eef4f7; line-height: 1; margin-bottom: 2mm;
  }
  .section-headline { font-size: 22pt; font-weight: 800; color: #0f172a; max-width: 150mm; }
  .section-body p { font-size: 12pt; }
  .keypoints {
    margin-top: 8mm; background: #f8fafc; border: 1px solid var(--line);
    border-radius: 8px; padding: 6mm 7mm;
  }
  .keypoints-title {
    font-size: 9pt; letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--muted); font-weight: 700; margin-bottom: 3mm;
  }
  .keypoints ul { list-style: none; }
  .keypoints li {
    position: relative; padding-left: 8mm; margin-bottom: 3mm;
    font-size: 11.5pt; color: #1e293b; line-height: 1.5;
  }
  .keypoints li::before {
    content: ""; position: absolute; left: 0; top: 2.4mm;
    width: 3.4mm; height: 3.4mm; border-radius: 50%; background: var(--accent);
  }

  /* ---------- Priorities ---------- */
  .priority {
    display: flex; gap: 6mm; padding: 6mm 0; border-bottom: 1px solid var(--line);
  }
  .priority:last-child { border-bottom: none; }
  .priority-num {
    width: 10mm; height: 10mm; flex: none; border-radius: 50%;
    background: var(--navy); color: #fff; font-weight: 800; font-size: 12pt;
    display: flex; align-items: center; justify-content: center;
  }
  .priority-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 6mm; }
  .priority-title { font-size: 13.5pt; font-weight: 700; color: #0f172a; }
  .priority-badges { display: flex; gap: 3mm; flex: none; }
  .badge {
    font-size: 8.5pt; font-weight: 700; padding: 1.6mm 3mm; border-radius: 20px;
    border: 1px solid transparent; white-space: nowrap; text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .badge.muted { background: #f1f5f9; color: #475569; border-color: var(--line); }
  .priority-why { margin-top: 2mm; font-size: 11pt; color: #475569; }

  /* ---------- Closing ---------- */
  .closing {
    background: radial-gradient(120% 90% at 20% 10%, #123b4d 0%, var(--navy) 60%);
    color: #e6f6fb; display: flex; flex-direction: column; justify-content: center;
    color-scheme: dark;
  }
  .closing h2 { font-size: 26pt; color: #fff; font-weight: 800; max-width: 150mm; }
  .closing p { color: #c3e0ea; font-size: 12.5pt; max-width: 150mm; }
  .closing .cta {
    margin-top: 10mm; display: inline-block; align-self: flex-start;
    background: var(--accent); color: #052734; font-weight: 800; font-size: 12pt;
    padding: 4mm 8mm; border-radius: 8px;
  }

  /* ---------- Footer ---------- */
  .footer {
    position: absolute; bottom: 12mm; left: 20mm; right: 20mm;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 8.5pt; color: var(--muted); border-top: 1px solid var(--line); padding-top: 3mm;
  }
  .footer .accent { color: var(--accent); font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
  .section-title { font-size: 22pt; font-weight: 800; color: #0f172a; }
</style>
</head>
<body>

  <!-- COVER -->
  <section class="page cover">
    <div class="brand">${esc(brand)}</div>
    <div class="cover-mid">
      <div class="eyebrow">Digital Growth Audit</div>
      <h1>${esc(content.headline)}</h1>
      <div class="tagline">${esc(content.tagline)}</div>
    </div>
    <div class="cover-foot">
      <div class="cover-meta">
        <div><b>${esc(meta.businessName)}</b></div>
        ${meta.industry ? `<div>${esc(meta.industry)}</div>` : ""}
        ${meta.location ? `<div>${esc(meta.location)}</div>` : ""}
        ${meta.website ? `<div>${esc(meta.website)}</div>` : ""}
        <div>${esc(meta.generatedDate)}</div>
      </div>
      <div class="ring">
        <div class="ring-inner">
          <div class="ring-score">${overall}</div>
          <div class="ring-cap">${scoreLabel(overall)}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- EXECUTIVE SUMMARY -->
  <section class="page">
    <div class="eyebrow-dark">Executive Summary</div>
    <div class="section-title">Where ${esc(meta.businessName)} stands today</div>
    <div class="rule"></div>
    <div class="verdict">${esc(content.overallVerdict)}</div>
    <div>${paragraphs(content.executiveSummary)}</div>
    <div class="footer"><span class="accent">${esc(brand)}</span><span>Confidential — prepared for ${esc(
      meta.businessName
    )}</span></div>
  </section>

  <!-- SCORECARD -->
  <section class="page">
    <div class="eyebrow-dark">Performance Scorecard</div>
    <div class="section-title">Your results at a glance</div>
    <div class="rule"></div>
    <p class="lead">Each area was scored from 0–100 based on our analysis. Higher scores indicate stronger performance and lower risk.</p>
    <div class="scorecard">${scorecardRows}</div>
    <div class="footer"><span class="accent">${esc(brand)}</span><span>Overall score ${overall}/100 · ${scoreLabel(
    overall
  )}</span></div>
  </section>

  <!-- SECTIONS -->
  ${sectionPages}

  <!-- PRIORITIES -->
  <section class="page">
    <div class="eyebrow-dark">Recommended Roadmap</div>
    <div class="section-title">Where to focus first</div>
    <div class="rule"></div>
    <p class="lead">These are the highest-leverage moves, prioritized by impact and effort.</p>
    <div class="priorities">${priorityCards}</div>
    <div class="footer"><span class="accent">${esc(brand)}</span><span>Prepared for ${esc(
    meta.businessName
  )}</span></div>
  </section>

  <!-- CLOSING -->
  <section class="page closing">
    <div class="eyebrow" style="color:#7dd3fc;letter-spacing:0.22em;text-transform:uppercase;font-size:10pt;margin-bottom:6mm;">Let's build momentum</div>
    <h2>Ready to turn this roadmap into results?</h2>
    <p style="margin-top:6mm;">${esc(content.closing)}</p>
    <div class="cta">Book your strategy session</div>
  </section>

</body>
</html>`;
}
