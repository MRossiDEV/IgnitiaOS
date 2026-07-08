import { execFile } from "node:child_process"
import { promisify } from "node:util"
import type { DeveloperExecutionResult } from "./DeveloperTypes"

const execFileAsync = promisify(execFile)

async function runGit(args: string[]): Promise<DeveloperExecutionResult> {
  try {
    const { stdout, stderr } = await execFileAsync("git", args, { maxBuffer: 10 * 1024 * 1024 })

    return {
      success: true,
      action: "git",
      output: [stdout, stderr].filter(Boolean).join("\n").trim(),
      metadata: { args },
    }
  } catch (error) {
    return {
      success: false,
      action: "git",
      error: error instanceof Error ? error.message : "Unknown git error",
      metadata: { args },
    }
  }
}

export const Git = {
  status() {
    return runGit(["status", "--short"])
  },
  diff(args: string[] = []) {
    return runGit(["diff", ...args])
  },
  log(args: string[] = ["-1", "--stat"]) {
    return runGit(["log", ...args])
  },
  branch() {
    return runGit(["branch", "--show-current"])
  },
  remote() {
    return runGit(["remote", "-v"])
  },
}
