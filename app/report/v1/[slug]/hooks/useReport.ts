"use client";

import { useEffect, useState } from "react";
import { Report } from "../lib/types";

export function useReport(slug: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!slug) return;
    loadReport();
  }, [slug]);

  async function loadReport() {
    try {
      if (!slug) return;

      const res = await fetch(`/api/v1/reports/${slug}`, {
        cache: "no-store",
      });

      console.log("Status:", res.status);

      if (!res.ok) {
        console.error("API Error:", res.status);
        setReport(null);
        return;
      }

      const json = await res.json();

      console.log("JSON:", json);
      console.log("API Response:", res);

      if (!json?.report) {
        console.error("No report in response:", json);
        setReport(null);
        return;
      }

      setReport(json.report);
    } catch (err) {
      console.error("Fetch failed:", err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  return { loading, report };
}
