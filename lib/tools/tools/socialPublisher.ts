import type { Tool } from "@/lib/tools/types"
import { instagramPublisher } from "@/lib/tools/tools/instagramPublisher"

type SupportedPlatform = "instagram"

function parsePlatform(input: Record<string, any>): SupportedPlatform {
  const platform = String(input.platform || "instagram").trim().toLowerCase()

  if (platform === "instagram") {
    return "instagram"
  }

  throw new Error(`Unsupported social_publisher platform: ${platform}`)
}

export const socialPublisher: Tool = {
  name: "social_publisher",
  description:
    "Unified social publishing tool. Routes content generation, drafts, approvals, publishing and scheduler actions to the selected platform backend publisher",
  async run(input) {
    const platform = parsePlatform(input)

    switch (platform) {
      case "instagram": {
        return instagramPublisher.run(input)
      }

      default:
        throw new Error(`Unsupported social_publisher platform: ${platform}`)
    }
  },
}
