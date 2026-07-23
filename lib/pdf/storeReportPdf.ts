// ======================================================
// Store Report PDF
// lib/pdf/storeReportPdf.ts
// ======================================================
// Uploads a generated PDF buffer to Vercel Blob and returns
// its public URL, stored under a "reports/" path.
//
// Requires: npm install @vercel/blob
//
// Setup: Vercel Dashboard -> your project -> Storage -> 
// Create Database -> Blob. Vercel automatically injects
// BLOB_READ_WRITE_TOKEN into your project's env vars once
// the store is connected — no manual token copying needed
// on Vercel itself. For local dev, run `vercel env pull`
// to get it into your .env.local.
//
// Note: server-side uploads (this function) are limited to
// 4.5MB per file by Vercel's request body limit. A multi-page
// PDF report should be well under that, but if reports grow
// large enough to hit it, the fix is Vercel Blob's separate
// "client upload" flow (uploads go direct to Blob storage,
// bypassing the 4.5MB server limit) — different implementation,
// ask if you get there.

import { put } from "@vercel/blob";

export async function storeReportPdf(
  reportId: string,
  buffer: Buffer
): Promise<string> {
  const blob = await put(`reports/${reportId}.pdf`, buffer, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return blob.url;
}
