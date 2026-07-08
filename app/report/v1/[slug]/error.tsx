"use client";

import { useEffect } from "react";

export default function ErrorReport({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Report page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        
        <h1 className="text-2xl font-bold text-red-600">
          Failed to load report
        </h1>

        <p className="text-gray-600">
          We couldn’t load this report. It may not exist or there was a server issue.
        </p>

        {/* Dev debug (remove in prod if needed) */}
        <div className="text-xs text-gray-400 break-all">
          {error.message}
        </div>

        <div className="flex gap-3 justify-center pt-4">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Retry
          </button>

          <a
            href="/reports"
            className="px-4 py-2 border rounded"
          >
            Back to reports
          </a>
        </div>
      </div>
    </div>
  );
}