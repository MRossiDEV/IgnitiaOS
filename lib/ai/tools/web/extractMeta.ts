// ======================================================
// Extract Meta Description
// ======================================================

export function extractMetaDescription(
    html: string
): string {

    const match =
        html.match(
            /<meta\s+name=["']description["']\s+content=["']([^"]*)["']/i
        );

    if (!match)
        return "";

    return match[1].trim();

}