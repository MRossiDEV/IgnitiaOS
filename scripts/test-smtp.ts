// ======================================================
// Isolated SMTP auth test — bypasses the whole app.
// Usage: npx tsx scripts/test-smtp.ts reports
//        npx tsx scripts/test-smtp.ts mrossi
// ======================================================

import "dotenv/config";
import nodemailer from "nodemailer";

const account = process.argv[2];

if (account !== "reports" && account !== "mrossi") {
  console.error('Usage: npx tsx scripts/test-smtp.ts <"reports"|"mrossi">');
  process.exit(1);
}

const prefix = account === "reports" ? "SMTP_REPORTS" : "SMTP_MROSSI";
const user = process.env[`${prefix}_USER`];
const pass = process.env[`${prefix}_PASSWORD`];
const host = process.env.SMTP_HOST || "smtp.forwardemail.net";
const port = Number(process.env.SMTP_PORT || 465);

console.log("Testing account:", account);
console.log("Host:", host, "Port:", port);
console.log("User:", JSON.stringify(user)); // JSON.stringify reveals hidden whitespace
console.log(
  "Password length:",
  pass?.length,
  "| first char:",
  JSON.stringify(pass?.[0]),
  "| last char:",
  JSON.stringify(pass?.[pass.length - 1])
);

if (!user || !pass) {
  console.error("Missing user or password in env — check .env is loaded.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("\n❌ AUTH FAILED");
    console.error(error);
  } else {
    console.log("\n✅ AUTH SUCCESS:", success);
  }
});
