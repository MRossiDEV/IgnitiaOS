import type { Tool } from "../types"

export type DeveloperAction =
  | "filesystem"
  | "git"
  | "terminal"
  | "testing"
  | "build"
  | "deployment"

export type DeveloperExecutionResult = {
  success: boolean
  action: DeveloperAction
  output?: string
  error?: string
  metadata?: Record<string, any>
}

export type DeveloperToolInput = Record<string, any>

export type DeveloperTool = Tool
