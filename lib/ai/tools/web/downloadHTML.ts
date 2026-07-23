
export async function downloadHTML(
    url: string
): Promise<string> {

    if (!url) {
        throw new Error("URL is required.");
    }

    let website = url.trim();

    if (
        !website.startsWith("http://") &&
        !website.startsWith("https://")
    ) {
        website = `https://${website}`;
    }

    const response = await fetch(website, {

        method: "GET",
        headers: {
            "User-Agent":
                "IgnitiaAI Website Collector",
            "Accept":
                "text/html",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(
            `Failed to download website (${response.status})`
        );

    }
    return await response.text();
}