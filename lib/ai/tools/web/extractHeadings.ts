// ======================================================
// Extract Website Headings
// ======================================================

import * as cheerio from "cheerio";

export interface HeadingMap {

    h1: string[];

    h2: string[];

    h3: string[];

    h4: string[];

    h5: string[];

    h6: string[];

}

function clean(text: string): string {

    return text
        .replace(/\s+/g, " ")
        .trim();

}

export function extractHeadings(
    html: string
): HeadingMap {

    const $ = cheerio.load(html);

    return {

        h1: $("h1").map((_,el)=>clean($(el).text())).get(),

        h2: $("h2").map((_,el)=>clean($(el).text())).get(),

        h3: $("h3").map((_,el)=>clean($(el).text())).get(),

        h4: $("h4").map((_,el)=>clean($(el).text())).get(),

        h5: $("h5").map((_,el)=>clean($(el).text())).get(),

        h6: $("h6").map((_,el)=>clean($(el).text())).get(),

    };

}