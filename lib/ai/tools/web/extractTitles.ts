// ======================================================
// Extract HTML Title
// ======================================================

export function extractTitle(
    html: string
): string {

    const match =
        html.match(
            /<title[^>]*>([\s\S]*?)<\/title>/i
        );

    if (!match)
        return "";

    return match[1]
        .replace(/\s+/g, " ")
        .trim();

}