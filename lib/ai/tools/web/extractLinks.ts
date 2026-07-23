// ======================================================
// Extract Website Links
// ======================================================

import * as cheerio from "cheerio";

export interface WebsiteLink {

    href: string;

    text: string;

    internal: boolean;

    nofollow: boolean;

}

export function extractLinks(

    html: string,

    website: string

): WebsiteLink[] {

    const $ = cheerio.load(html);

    const base =
        new URL(website);

    const links: WebsiteLink[] = [];

    $("a[href]").each((_,el)=>{

        const href =
            $(el).attr("href") ?? "";

        if(!href)
            return;

        let internal = false;

        try{

            const url =
                new URL(
                    href,
                    website
                );

            internal =
                url.hostname === base.hostname;

        }

        catch{

            internal = false;

        }

        links.push({

            href,

            text:
                $(el)
                .text()
                .trim(),

            internal,

            nofollow:

                ($(el)
                .attr("rel") ?? "")
                .includes("nofollow"),

        });

    });

    return links;

}