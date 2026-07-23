import { Tool } from "../types"

export const sendEmail: Tool = {
  name: "send_email",
  description: "Send email to a user",

  run: async (input) => {
    const { to, subject, body } = input

    // Replace with Resend / SMTP later
    console.log("EMAIL SENT:", { to, subject, body })

    return { success: true }
  },
}