import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { DEFAULT_BUILD_ARGS, DEFAULT_BUILD_COMMAND } from "./constants"
import type { DeveloperExecutionResult } from "./DeveloperTypes"

const execFileAsync = promisify(execFile)

async function runCommand(command: string, args: string[], cwd = process.cwd()): Promise<DeveloperExecutionResult> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, { cwd, maxBuffer: 10 * 1024 * 1024 })

    return {
      success: true,
      action: "build",
      output: [stdout, stderr].filter(Boolean).join("\n").trim(),
      metadata: { command, args, cwd },
    }
  } catch (error) {
    return {
      success: false,
      action: "build",
      error: error instanceof Error ? error.message : "Unknown build error",
      metadata: { command, args, cwd },
    }
  }
}

export const Build = {
  run(input: Record<string, any>) {
    const command = String(input.command || DEFAULT_BUILD_COMMAND)
    const args = Array.isArray(input.args) ? input.args.map((value: unknown) => String(value)) : DEFAULT_BUILD_ARGS
    return runCommand(command, args, String(input.cwd || process.cwd()))
  },
}
