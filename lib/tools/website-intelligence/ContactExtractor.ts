import type { CheerioAPI } from "cheerio"
import type { WebsiteContacts } from "./WebsiteTypes"

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

export function extractContacts($: CheerioAPI): WebsiteContacts {
  const html = $.html()
  const emails = uniq((html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map((value) => value.toLowerCase()))
  const phones = uniq(html.match(/\+?\d[\d\s().-]{7,}\d/g) ?? [])
  const contactLinks = uniq(
    $("a[href]")
      .map((_, el) => ($(el).attr("href") ?? "").trim())
      .get()
      .filter((href) => /mailto:|tel:|contact|book|call|appointment/i.test(href))
  )

  return {
    emails,
    phones,
    contactLinks,
    forms: $("form").length,
  }
}
