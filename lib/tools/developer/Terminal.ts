import { spawn } from "node:child_process"
import type { DeveloperExecutionResult } from "./DeveloperTypes"
import { DEFAULT_COMMAND_TIMEOUT_MS } from "./constants"

function normalizeCommand(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function splitCommand(command: string, args: unknown) {
  const inputArgs = Array.isArray(args) ? args.map((arg) => String(arg)) : []
  if (inputArgs.length > 0) {
    return { command, args: inputArgs }
  }

  const [base, ...rest] = command.split(/\s+/).filter(Boolean)
  return {
    command: base,
    args: rest,
  }
}

export async function runTerminalCommand(input: Record<string, any>): Promise<DeveloperExecutionResult> {
  const rawCommand = normalizeCommand(input.command || input.cmd || input.shell)

  if (!rawCommand) {
    return {
      success: false,
      action: "terminal",
      error: "Missing command",
    }
  }

  const { command, args } = splitCommand(rawCommand, input.args)
  const cwd = normalizeCommand(input.cwd) || process.cwd()
  const timeoutMs = Number(input.timeoutMs || input.timeout || DEFAULT_COMMAND_TIMEOUT_MS)

  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      shell: Boolean(input.shell),
      env: { ...process.env, ...(input.env && typeof input.env === "object" ? input.env : {}) },
    })

    let stdout = ""
    let stderr = ""
    let finished = false

    const timeout = setTimeout(() => {
      if (!finished) {
        child.kill()
        finished = true
        resolve({
          success: false,
          action: "terminal",
          output: stdout.trim(),
          error: `Command timed out after ${timeoutMs}ms`,
          metadata: { command, args, cwd, timeoutMs },
        })
      }
    }, timeoutMs)

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString()
    })

    child.on("error", (error) => {
      if (finished) return
      clearTimeout(timeout)
      finished = true
      resolve({
        success: false,
        action: "terminal",
        output: stdout.trim(),
        error: error.message,
        metadata: { command, args, cwd },
      })
    })

    child.on("close", (code) => {
      if (finished) return
      clearTimeout(timeout)
      finished = true
      resolve({
        success: code === 0,
        action: "terminal",
        output: [stdout, stderr].filter(Boolean).join("\n").trim(),
        error: code === 0 ? undefined : `Command exited with code ${code}`,
        metadata: { command, args, cwd, exitCode: code },
      })
    })
  })
}
