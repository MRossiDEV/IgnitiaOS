-- ======================================================
-- Add pdf_url to free_reports
-- supabase/migrations/0002_free_reports_pdf_url.sql
-- ======================================================
-- Run this before using the PDF generation feature.
-- Stores the Vercel Blob URL (see lib/pdf/storeReportPdf.ts)
-- — no Supabase Storage bucket needed for this.

alter table public.free_reports
  add column if not exists pdf_url text null;
