import { readTextFile, writeTextFile, appendTextFile, listDirectory, statPath } from "./FileSystem"
import { Git } from "./Git"
import { runTerminalCommand } from "./Terminal"
import { Testing } from "./Testing"
import { Build } from "./Build"
import { planDeployment } from "./Deployment"
import type { DeveloperTool } from "./DeveloperTypes"

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

export const DeveloperTool: DeveloperTool = {
  name: "developer_tool",
  description: "Read files, manage git, run terminal commands, tests, builds, and deployment plans",
  async run(input) {
    const action = normalizeText(input.action || input.operation || input.type || "terminal").toLowerCase()

    if (action === "filesystem") {
      const fsAction = normalizeText(input.fsAction || input.fs || input.fileAction || "read").toLowerCase()

      if (fsAction === "write") return writeTextFile(String(input.path || input.filePath || ""), String(input.content || ""))
      if (fsAction === "append") return appendTextFile(String(input.path || input.filePath || ""), String(input.content || ""))
      if (fsAction === "list") return listDirectory(String(input.path || input.dirPath || process.cwd()))
      if (fsAction === "stat") return statPath(String(input.path || input.filePath || ""))
      return readTextFile(String(input.path || input.filePath || ""))
    }

    if (action === "git") {
      const gitAction = normalizeText(input.gitAction || input.command || "status").toLowerCase()

      if (gitAction === "diff") return Git.diff(Array.isArray(input.args) ? input.args.map((value: unknown) => String(value)) : [])
      if (gitAction === "log") return Git.log(Array.isArray(input.args) ? input.args.map((value: unknown) => String(value)) : ["-1", "--stat"])
      if (gitAction === "branch") return Git.branch()
      if (gitAction === "remote") return Git.remote()
      return Git.status()
    }

    if (action === "testing") {
      return Testing.run(input)
    }

    if (action === "build") {
      return Build.run(input)
    }

    if (action === "deployment") {
      return planDeployment(input)
    }

    return runTerminalCommand(input)
  },
}
