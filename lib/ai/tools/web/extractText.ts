// ======================================================
// Extract Visible Text
// ======================================================

import * as cheerio from "cheerio";


export function extractText(
    html:string
):string {


    const $ =
        cheerio.load(html);



    // Remove non-visible content

    $("script").remove();

    $("style").remove();

    $("noscript").remove();

    $("svg").remove();



    return $("body")
        .text()
        .replace(/\s+/g," ")
        .trim();

}