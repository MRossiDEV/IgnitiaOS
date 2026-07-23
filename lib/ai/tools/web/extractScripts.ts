// ======================================================
// Extract Javascript Files
// ======================================================

import * as cheerio from "cheerio";


export function extractScripts(

    html:string,

    website:string

):string[] {


    const $ =
        cheerio.load(html);



    const scripts:string[] = [];



    $("script[src]")
        .each((_,element)=>{


            const src =
                $(element)
                .attr("src");



            if(!src)
                return;



            try{


                scripts.push(

                    new URL(
                        src,
                        website
                    ).toString()

                );


            }

            catch{

                //

            }


        });



    return scripts;

}