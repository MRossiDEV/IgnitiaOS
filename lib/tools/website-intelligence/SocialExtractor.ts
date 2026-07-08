import type { CheerioAPI } from "cheerio"
import type { WebsiteSocials } from "./WebsiteTypes"

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

export function extractSocials($: CheerioAPI): WebsiteSocials {
  const socials: Record<keyof WebsiteSocials, string[]> = {
    linkedin: [],
    facebook: [],
    instagram: [],
    x: [],
    threads: [],
    youtube: [],
  }

  $("a[href]").each((_, element) => {
    const href = ($(element).attr("href") ?? "").trim()
    if (/linkedin\.com/i.test(href)) socials.linkedin.push(href)
    if (/facebook\.com/i.test(href)) socials.facebook.push(href)
    if (/instagram\.com/i.test(href)) socials.instagram.push(href)
    if (/(twitter\.com|x\.com)/i.test(href)) socials.x.push(href)
    if (/threads\.net/i.test(href)) socials.threads.push(href)
    if (/youtube\.com|youtu\.be/i.test(href)) socials.youtube.push(href)
  })

  return {
    linkedin: uniq(socials.linkedin),
    facebook: uniq(socials.facebook),
    instagram: uniq(socials.instagram),
    x: uniq(socials.x),
    threads: uniq(socials.threads),
    youtube: uniq(socials.youtube),
  }
}
