import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: getRequiredEnv("SMTP_HOST"),
    port: Number(getRequiredEnv("SMTP_PORT")),
    secure: Number(getRequiredEnv("SMTP_PORT")) === 465,

    auth: {
      user: getRequiredEnv("SMTP_USER"),
      pass: getRequiredEnv("SMTP_PASS"),
    },
  });

  return transporter;
}

/**
 * Keeps existing imports working.
 *
 * Example:
 *
 * import { smtp } from "@/lib/email/smtp";
 *
 * await smtp.sendMail(...)
 */
export const smtp = new Proxy(
  {} as nodemailer.Transporter,
  {
    get(_target, prop, receiver) {
      return Reflect.get(
        getTransporter(),
        prop,
        receiver
      );
    },
  }
);

/**
 * Optional helper to verify SMTP configuration.
 */
export async function verifySMTP() {
  const conn = getTransporter();

  await conn.verify();

  console.log("✅ SMTP connection verified.");
}