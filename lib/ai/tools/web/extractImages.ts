// ======================================================
// Extract Website Images
// ======================================================

import * as cheerio from "cheerio";

export interface WebsiteImage{

    src:string;

    alt:string;

}

export function extractImages(

    html:string,

    website:string

):WebsiteImage[]{

    const $=cheerio.load(html);

    const images:WebsiteImage[]=[];

    $("img").each((_,img)=>{

        const src=$(img).attr("src");

        if(!src)
            return;

        const absolute=
            new URL(
                src,
                website
            ).toString();

        images.push({

            src:absolute,

            alt:
                $(img)
                .attr("alt") ?? "",

        });

    });

    return images;

}