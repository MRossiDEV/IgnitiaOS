import { promises as fs } from "node:fs"
import path from "node:path"
import type { DeveloperExecutionResult } from "./DeveloperTypes"

function resolvePath(filePath: string) {
  return path.resolve(filePath)
}

export async function readTextFile(filePath: string): Promise<DeveloperExecutionResult> {
  const resolved = resolvePath(filePath)
  const content = await fs.readFile(resolved, "utf8")

  return {
    success: true,
    action: "filesystem",
    output: content,
    metadata: { filePath: resolved, operation: "read" },
  }
}

export async function writeTextFile(filePath: string, content: string): Promise<DeveloperExecutionResult> {
  const resolved = resolvePath(filePath)
  await fs.mkdir(path.dirname(resolved), { recursive: true })
  await fs.writeFile(resolved, content, "utf8")

  return {
    success: true,
    action: "filesystem",
    metadata: { filePath: resolved, operation: "write", bytes: Buffer.byteLength(content, "utf8") },
  }
}

export async function appendTextFile(filePath: string, content: string): Promise<DeveloperExecutionResult> {
  const resolved = resolvePath(filePath)
  await fs.mkdir(path.dirname(resolved), { recursive: true })
  await fs.appendFile(resolved, content, "utf8")

  return {
    success: true,
    action: "filesystem",
    metadata: { filePath: resolved, operation: "append", bytes: Buffer.byteLength(content, "utf8") },
  }
}

export async function listDirectory(dirPath: string): Promise<DeveloperExecutionResult> {
  const resolved = resolvePath(dirPath)
  const entries = await fs.readdir(resolved, { withFileTypes: true })

  return {
    success: true,
    action: "filesystem",
    output: entries.map((entry) => `${entry.isDirectory() ? "[dir]" : "[file]"} ${entry.name}`).join("\n"),
    metadata: { dirPath: resolved, operation: "list", count: entries.length },
  }
}

export async function statPath(targetPath: string): Promise<DeveloperExecutionResult> {
  const resolved = resolvePath(targetPath)
  const stats = await fs.stat(resolved)

  return {
    success: true,
    action: "filesystem",
    metadata: {
      path: resolved,
      operation: "stat",
      isDirectory: stats.isDirectory(),
      isFile: stats.isFile(),
      size: stats.size,
      modifiedAt: stats.mtime.toISOString(),
    },
  }
}
