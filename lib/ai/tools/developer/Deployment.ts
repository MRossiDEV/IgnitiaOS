import path from "node:path"
import { promises as fs } from "node:fs"
import type { DeveloperExecutionResult } from "./DeveloperTypes"
import { SUPPORTED_DEPLOYMENT_TARGETS } from "./constants"

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

async function readPackageJson(cwd: string) {
  const filePath = path.join(cwd, "package.json")
  const content = await fs.readFile(filePath, "utf8")
  return JSON.parse(content) as { scripts?: Record<string, string> }
}

export async function planDeployment(input: Record<string, any>): Promise<DeveloperExecutionResult> {
  const cwd = normalizeText(input.cwd) || process.cwd()
  const target = normalizeText(input.target || input.platform || "vercel")
  const supportedTarget = (SUPPORTED_DEPLOYMENT_TARGETS as readonly string[]).includes(target) ? target : "manual"

  const packageJson = await readPackageJson(cwd)
  const scripts = packageJson.scripts || {}

  const plan = {
    target: supportedTarget,
    cwd,
    scripts,
    recommendations: [
      scripts.build ? "Build script detected" : "Add a build script before deploying",
      scripts.lint ? "Lint script detected" : "Add a lint script for pre-deployment checks",
      supportedTarget === "vercel" ? "Connect the repository to Vercel and deploy from the main branch" : `Follow the ${supportedTarget} deployment process`,
    ],
  }

  return {
    success: true,
    action: "deployment",
    output: JSON.stringify(plan, null, 2),
    metadata: plan,
  }
}
