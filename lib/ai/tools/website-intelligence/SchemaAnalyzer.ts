import type { CheerioAPI } from "cheerio"
import type { WebsiteSchema } from "./WebsiteTypes"

export function analyzeSchema($: CheerioAPI): WebsiteSchema {
  const jsonLdScripts = $("script[type='application/ld+json']")
  const schemaTypes = new Set<string>()

  jsonLdScripts.each((_, element) => {
    const content = $(element).text().trim()
    if (!content) return

    try {
      const parsed = JSON.parse(content)
      const items = Array.isArray(parsed) ? parsed : [parsed]

      for (const item of items) {
        const type = item?.["@type"]
        if (typeof type === "string") schemaTypes.add(type)
        if (Array.isArray(type)) {
          for (const entry of type) {
            if (typeof entry === "string") schemaTypes.add(entry)
          }
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  })

  return {
    jsonLdCount: jsonLdScripts.length,
    schemaTypes: [...schemaTypes],
    hasOrganization: schemaTypes.has("Organization"),
    hasWebSite: schemaTypes.has("WebSite"),
    hasLocalBusiness: schemaTypes.has("LocalBusiness"),
  }
}
