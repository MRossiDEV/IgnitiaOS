// ======================================================
// Extract Forms
// ======================================================

import * as cheerio from "cheerio";


export function extractForms(

    html:string

){


    const $ =
        cheerio.load(html);



    return $("form")
        .map((_,form)=>{


            return {


                action:

                    $(form)
                    .attr("action")
                    ??
                    "",



                method:

                    (
                        $(form)
                        .attr("method")
                        ??
                        "GET"
                    )
                    .toUpperCase(),



                inputs:

                    $(form)
                    .find("input")
                    .map((_,input)=>{


                        return {


                            type:

                                $(input)
                                .attr("type")
                                ??
                                "text",



                            name:

                                $(input)
                                .attr("name")
                                ??
                                "",



                            required:

                                $(input)
                                .is("[required]"),


                        };


                    })
                    .get(),


            };


        })
        .get();


}