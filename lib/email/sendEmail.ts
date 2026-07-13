import { smtp } from "./smtp";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: {
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }[];
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  try {
    const from =
      options.from ||
      process.env.SMTP_FROM ||
      process.env.SMTP_USER;

    if (!from) {
      throw new Error(
        "Missing SMTP_FROM or SMTP_USER environment variable."
      );
      }
      
    console.log("Email ABOUT TO SEND successfully");

    const info = await smtp.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    });

    console.log(
      `📧 Email sent: ${options.to}`
    );

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error(
      "SMTP SEND ERROR",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown SMTP error",
    };
  }
}