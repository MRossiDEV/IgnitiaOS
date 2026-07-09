import type { Tool } from "./types"

export interface ToolExecutionResult {
  success: boolean
  tool: string
  data?: any
  error?: string
  duration: number
}

let cachedTools: Record<string, Tool> | null = null

async function getTools(): Promise<Record<string, Tool>> {
  if (cachedTools) {
    return cachedTools
  }

  const { tools } = await import("./registry")
  cachedTools = tools
  return cachedTools
}

export async function runTool(
  toolName: string,
  input: Record<string, any> = {}
): Promise<ToolExecutionResult> {
  const startTime = Date.now()

  try {
    const tools = await getTools()
    const tool = tools[toolName]

    if (!tool) {
      return {
        success: false,
        tool: toolName,
        error: `Tool '${toolName}' not found`,
        duration: Date.now() - startTime,
      }
    }

    if (typeof tool.run !== "function") {
      return {
        success: false,
        tool: toolName,
        error: `Tool '${toolName}' has no run() function`,
        duration: Date.now() - startTime,
      }
    }

    const result = await tool.run(input)

    return {
      success: true,
      tool: toolName,
      data: result,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    console.error(`TOOL ERROR [${toolName}]`, error)

    return {
      success: false,
      tool: toolName,
      error:
        error instanceof Error
          ? error.message
          : "Unknown tool execution error",
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Execute multiple tools sequentially
 */
export async function runTools(
  calls: {
    tool: string
    input?: Record<string, any>
  }[]
): Promise<ToolExecutionResult[]> {
  const results: ToolExecutionResult[] = []

  for (const call of calls) {
    const result = await runTool(
      call.tool,
      call.input || {}
    )

    results.push(result)
  }

  return results
}

/**
 * Get available tools for agents
 */
export async function getAvailableTools() {
  const tools = await getTools()

  return Object.entries(tools).map(([id, tool]) => ({
    id,
    name: tool.name,
    description: tool.description,
  }))
}

/**
 * Check if a tool exists
 */
export async function hasTool(toolName: string): Promise<boolean> {
  const tools = await getTools()
  return !!tools[toolName]
}
