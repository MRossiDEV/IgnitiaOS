// ======================================================
// IgnitiaOS Website Crawler
// lib/ai/tools/web/crawlWebsite.ts
// ======================================================

import { WebsiteData } from "@/lib/ai/collectors/website/types";


import {
    downloadHTML
} from "./downloadHTML";


import {
    extractTitle
} from "./extractTitles";


import {
    extractMetaDescription
} from "./extractMeta";


import {
    extractLanguage
} from "./extractLanguage";


import {
    extractHeadings
} from "./extractHeadings";


import {
    extractLinks
} from "./extractLinks";


import {
    extractImages
} from "./extractImages";


import {
    extractText
} from "./extractText";


import {
    extractScripts
} from "./extractScripts";


import {
    extractStylesheets
} from "./extractStylesheet";


import {
    extractForms
} from "./extractForms";

import {
    detectTechnologies
} from "./detectTechnologies";



export async function crawlWebsite(

    websiteUrl:string

):Promise<WebsiteData>{



    if(!websiteUrl){

        throw new Error(
            "Website URL required"
        );

    }



    let url =
        websiteUrl.trim();



    if(

        !url.startsWith("http://")
        &&
        !url.startsWith("https://")

    ){

        url =
            `https://${url}`;

    }




    console.log(
        "Crawling:",
        url
    );




    /**
     * SINGLE WEBSITE REQUEST
     */
    const html =
        await downloadHTML(
            url
        );





    const snapshot:WebsiteData = {


        url,



        html,



        text:
            extractText(
                html
            ),



        title:
            extractTitle(
                html
            ),



        description:
            extractMetaDescription(
                html
            ),



        language:
            extractLanguage(
                html
            ),



        headings:
            extractHeadings(
                html
            ),



        links:
            extractLinks(
                html,
                url
            ),



        images:
            extractImages(
                html,
                url
            ),



        forms:
            extractForms(
                html
            ),



        scripts:
            extractScripts(
                html,
                url
            ),



        stylesheets:
            extractStylesheets(
                html,
                url
            ),



        technologies:
            detectTechnologies(
                html,
                extractScripts(
                    html,
                    url
                ),
                extractStylesheets(
                    html,
                    url
                )
            ),



        schema:[],



        metadata:{},


    };



    return snapshot;


}