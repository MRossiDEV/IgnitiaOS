import type { WebsiteTechnology } from "./WebsiteTypes"

export function detectTechnology(html: string, headers: Record<string, string>): WebsiteTechnology {
  const checks: Array<[string, RegExp]> = [
    ["Next.js", /_next\//i],
    ["React", /react|__REACT_DEVTOOLS_GLOBAL_HOOK__/i],
    ["Vue", /vue(?:\.runtime|\.js)?/i],
    ["WordPress", /wp-content|wp-includes|wordpress/i],
    ["Shopify", /cdn\.shopify\.com|shopify/i],
    ["Google Analytics", /gtag\(|googletagmanager\.com/i],
    ["Meta Pixel", /connect\.facebook\.net\/en_US\/fbevents\.js|fbq\(/i],
    ["Cloudflare", /cloudflare/i],
  ]

  const detected = checks.filter(([, regex]) => regex.test(html)).map(([name]) => name)
  const server = headers.server ?? ""
  const poweredBy = headers["x-powered-by"] ?? ""

  return {
    detected,
    server,
    poweredBy,
    cdn: /cloudflare|fastly|akamai/i.test(`${server} ${poweredBy}`),
  }
}
