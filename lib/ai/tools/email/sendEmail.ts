// ======================================================
// Tool: Send Email
// lib/ai/tools/email/sendEmail.ts
// ======================================================
// Rules for tools: no AI, stateless, reusable, small, fast.
// Tools never know anything about reports — domain-specific
// content is composed by a service, not here.
//
// Supports TWO separate SMTP identities on the same Forward
// Email domain, since Forward Email requires the From header
// to match whichever alias you authenticated as:
//
//   "reports" -> reports@ignitiaai.app  (automated report emails)
//   "mrossi"  -> mrossi@ignitiaai.app   (manual client comms)
//
// Each alias needs its OWN generated password from Forward
// Email (My Account -> Domains -> Aliases -> Generate Password
// next to that specific alias) — not a shared/catch-all one.
//
// Requires: npm install nodemailer
//           npm install -D @types/nodemailer
//
// Env vars:
//   SMTP_HOST              default: smtp.forwardemail.net
//   SMTP_PORT              default: 465
//   SMTP_REPORTS_USER      reports@ignitiaai.app
//   SMTP_REPORTS_PASSWORD  that alias's generated password
//   SMTP_REPORTS_FROM      optional, defaults to SMTP_REPORTS_USER
//   SMTP_MROSSI_USER       mrossi@ignitiaai.app
//   SMTP_MROSSI_PASSWORD   that alias's generated password
//   SMTP_MROSSI_FROM       optional, defaults to SMTP_MROSSI_USER

import nodemailer from "nodemailer";

export type EmailAccount = "reports" | "mrossi";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Cosmetic display name only, e.g. "IgnitiaAI Reports" — the
   *  underlying address always stays whatever the account's alias is,
   *  since Forward Email rejects mismatched From addresses. */
  displayName?: string;
  /** Which alias to send as. Defaults to "mrossi". */
  account?: EmailAccount;
  attachments?: EmailAttachment[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface AccountConfig {
  user: string;
  pass: string;
  from: string;
}

function getAccountConfig(account: EmailAccount): AccountConfig {
  const prefix = account === "reports" ? "SMTP_REPORTS" : "SMTP_MROSSI";
  const user = process.env[`${prefix}_USER`]?.trim();
  const pass = process.env[`${prefix}_PASSWORD`]?.trim();
  const from = process.env[`${prefix}_FROM`]?.trim() || user;

  if (!user || !pass) {
    throw new Error(
      `${prefix}_USER / ${prefix}_PASSWORD are not set for the "${account}" account.`
    );
  }

  return { user, pass, from: from! };
}

const transporterCache = new Map<EmailAccount, nodemailer.Transporter>();

function getTransporter(account: EmailAccount): {
  transporter: nodemailer.Transporter;
  from: string;
} {
  const config = getAccountConfig(account);

  let transporter = transporterCache.get(account);
  if (!transporter) {
    const host = process.env.SMTP_HOST || "smtp.forwardemail.net";
    const port = Number(process.env.SMTP_PORT || 465);

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: config.user, pass: config.pass },
    });

    transporterCache.set(account, transporter);
  }

  return { transporter, from: config.from };
}

export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  try {
    const account = input.account ?? "mrossi";
    const { transporter, from } = getTransporter(account);

    const fromHeader = input.displayName
      ? `"${input.displayName}" <${from}>`
      : from;

    const info = await transporter.sendMail({
      from: fromHeader,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType ?? "application/pdf",
      })),
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    return { success: false, error: error.message ?? "Unknown SMTP error" };
  }
}
