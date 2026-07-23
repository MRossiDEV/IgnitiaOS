// ======================================================
// Notification Service
// lib/services/NotificationService.ts
// ======================================================
// Composes report-specific email content and sends it via
// the generic sendEmail tool. This is where "report" domain
// knowledge lives — the tool itself stays generic.

import { sendEmail } from "@/lib/ai/tools/email";
import { aiLogger } from "@/lib/ai/core/logger";

export interface ReportReadyEmailParams {
  to: string;
  fullName: string;
  businessName: string;
  reportCode: string;
  accessCode: string;
  pdfBuffer?: Buffer;
}

function reportUrl(reportCode: string, accessCode: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://ignitiaai.app";
  return `${base}/report/v1/free/${reportCode}?code=${accessCode}`;
}

export class NotificationService {
  static async sendReportReadyEmail(
    params: ReportReadyEmailParams
  ): Promise<void> {
    const url = reportUrl(params.reportCode, params.accessCode);
    const firstName = params.fullName.split(" ")[0] || params.fullName;

    const html = `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
        <h2>Your free report is ready, ${firstName}!</h2>
        <p>
          We finished analyzing <strong>${params.businessName}</strong>.
          Your report covers SEO, website experience, conversion, branding,
          Google Business presence, and social media.
        </p>
        <p style="margin: 24px 0;">
          <a href="${url}"
             style="background:#111827;color:#fff;padding:12px 20px;
                    border-radius:6px;text-decoration:none;font-weight:bold;">
            View your report
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px;">
          If the button doesn't work, copy this link: ${url}
        </p>
      </div>
    `;

    const text = `Your free report for ${params.businessName} is ready.\n\nView it here: ${url}`;

    const result = await sendEmail({
      to: params.to,
      subject: `Your free report for ${params.businessName} is ready`,
      html,
      text,
      account: "reports",
      displayName: "IgnitiaAI Reports",
      attachments: params.pdfBuffer
        ? [
            {
              filename: `${params.businessName.replace(/[^a-z0-9]/gi, "-")}-growth-audit.pdf`,
              content: params.pdfBuffer,
            },
          ]
        : undefined,
    });

    // Email failure should never fail the whole pipeline run —
    // the report itself is already saved successfully at this point.
    if (!result.success) {
      aiLogger.error(
        "NotificationService",
        "Failed to send report-ready email",
        result.error
      );
    } else {
      aiLogger.success("NotificationService", "Report-ready email sent", {
        to: params.to,
      });
    }
  }
}
