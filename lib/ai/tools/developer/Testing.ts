import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { DEFAULT_TEST_ARGS, DEFAULT_TEST_COMMAND } from "./constants"
import type { DeveloperExecutionResult } from "./DeveloperTypes"

const execFileAsync = promisify(execFile)

async function runCommand(command: string, args: string[], cwd = process.cwd()): Promise<DeveloperExecutionResult> {
  try {
    const { stdout, stderr } = await execFileAsync(command, args, { cwd, maxBuffer: 10 * 1024 * 1024 })

    return {
      success: true,
      action: "testing",
      output: [stdout, stderr].filter(Boolean).join("\n").trim(),
      metadata: { command, args, cwd },
    }
  } catch (error) {
    return {
      success: false,
      action: "testing",
      error: error instanceof Error ? error.message : "Unknown testing error",
      metadata: { command, args, cwd },
    }
  }
}

export const Testing = {
  lint(cwd?: string) {
    return runCommand(DEFAULT_TEST_COMMAND, DEFAULT_TEST_ARGS, cwd)
  },
  run(input: Record<string, any>) {
    const command = String(input.command || input.testCommand || DEFAULT_TEST_COMMAND)
    const args = Array.isArray(input.args) ? input.args.map((value: unknown) => String(value)) : DEFAULT_TEST_ARGS
    return runCommand(command, args, String(input.cwd || process.cwd()))
  },
}
