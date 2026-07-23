// ======================================================
// Extract Stylesheets
// ======================================================

import * as cheerio from "cheerio";


export function extractStylesheets(

    html:string,

    website:string

):string[] {


    const $ =
        cheerio.load(html);



    const styles:string[] = [];



    $('link[rel="stylesheet"]')
        .each((_,element)=>{


            const href =
                $(element)
                .attr("href");



            if(!href)
                return;



            try{


                styles.push(

                    new URL(
                        href,
                        website
                    ).toString()

                );


            }

            catch{

                //

            }


        });



    return styles;

}