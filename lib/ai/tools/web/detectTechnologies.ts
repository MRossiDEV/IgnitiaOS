// ======================================================
// IgnitiaOS Technology Detector
// lib/ai/tools/web/detectTechnologies.ts
// ======================================================


export function detectTechnologies(

    html:string,

    scripts:string[],

    stylesheets:string[]

):string[] {


    const detected =
        new Set<string>();


    const content =
        (
            html
            +
            scripts.join(" ")
            +
            stylesheets.join(" ")
        )
        .toLowerCase();



    // CMS

    if(
        content.includes("wp-content")
        ||
        content.includes("wordpress")
    ){

        detected.add(
            "WordPress"
        );

    }



    if(
        content.includes("shopify")
        ||
        content.includes("cdn.shopify")
    ){

        detected.add(
            "Shopify"
        );

    }



    if(
        content.includes("wixstatic")
    ){

        detected.add(
            "Wix"
        );

    }



    if(
        content.includes("squarespace")
    ){

        detected.add(
            "Squarespace"
        );

    }




    // Javascript frameworks


    if(
        content.includes("__next")
        ||
        content.includes("_next/static")
    ){

        detected.add(
            "Next.js"
        );

    }



    if(
        content.includes("react")
        ||
        content.includes("react-dom")
    ){

        detected.add(
            "React"
        );

    }



    if(
        content.includes("vue")
    ){

        detected.add(
            "Vue"
        );

    }



    if(
        content.includes("angular")
    ){

        detected.add(
            "Angular"
        );

    }





    // Analytics


    if(
        content.includes(
            "google-analytics"
        )
        ||
        content.includes(
            "gtag"
        )
    ){

        detected.add(
            "Google Analytics"
        );

    }



    if(
        content.includes(
            "googletagmanager"
        )
    ){

        detected.add(
            "Google Tag Manager"
        );

    }



    if(
        content.includes(
            "facebook.net"
        )
        ||
        content.includes(
            "fbevents"
        )
    ){

        detected.add(
            "Meta Pixel"
        );

    }





    // Marketing tools


    if(
        content.includes(
            "hotjar"
        )
    ){

        detected.add(
            "Hotjar"
        );

    }



    if(
        content.includes(
            "hubspot"
        )
    ){

        detected.add(
            "HubSpot"
        );

    }



    if(
        content.includes(
            "intercom"
        )
    ){

        detected.add(
            "Intercom"
        );

    }



    // CDN


    if(
        content.includes(
            "cloudflare"
        )
    ){

        detected.add(
            "Cloudflare"
        );

    }



    return Array.from(
        detected
    );

}