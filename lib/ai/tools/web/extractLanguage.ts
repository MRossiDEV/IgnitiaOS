// ======================================================
// Extract HTML Language
// ======================================================

export function extractLanguage(
    html: string
): string {

    const match =
        html.match(
            /<html[^>]*lang=["']([^"']+)["']/i
        );

    if (!match)
        return "";

    return match[1];

}