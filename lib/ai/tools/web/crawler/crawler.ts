import * as cheerio from "cheerio";

import {
  WebsiteMemory,
} from "../memory/temporary";


const MAX_PAGES = 8;
const TIMEOUT = 15000;
const visited = new Set<string>();

function normalizeUrl(
  base: string,
  href: string
) {

  try {

    const url =
      new URL(href, base);
      url.hash = "";
      
    return url.href;

  } catch {

    return null;

  }

}



async function fetchPage(
  url:string
) {

  const controller =
    new AbortController();


  const timeout =
    setTimeout(
      () => controller.abort(),
      TIMEOUT
    );


  try {

    const response =
      await fetch(url,{
        signal:
          controller.signal,

        headers:{
          "User-Agent":
          "IgnitiaAI-AuditBot/1.0"
        }
      });

    clearTimeout(timeout);

    if(!response.ok)
      return null;


    return await response.text();

  } catch {

    clearTimeout(timeout);

    return null;

  }

}




function extractLinks(
  html:string,
  base:string
){

  const $ =
    cheerio.load(html);


  const links:string[]=[];


  $("a[href]").each(
    (_,el)=>{

      const href =
        $(el).attr("href");


      if(!href)
        return;


      const url =
        normalizeUrl(
          base,
          href
        );


      if(
        url &&
        url.startsWith(
          new URL(base).origin
        )
      ){

        links.push(url);

      }

    }
  );


  return links;

}





function extractPageData(
  html:string,
  url:string
){

  const $ =
    cheerio.load(html);


  $("script").remove();

  $("style").remove();


  const title =
    $("title")
      .text()
      .trim();


  const description =
    $('meta[name="description"]')
      .attr("content")
      ?.trim();


  const content =
    $("body")
      .text()
      .replace(/\s+/g," ")
      .trim();



  return {

    url,

    title,

    description,

    content:
      content.substring(
        0,
        5000
      ),

  };

}




export async function crawlWebsite(
  website:string
):Promise<WebsiteMemory>{


  visited.clear();


  const queue:string[]=[
    website
  ];


  const pages:any[]=[];



  while(
    queue.length &&
    pages.length < MAX_PAGES
  ){

    const url =
      queue.shift()!;


    if(
      visited.has(url)
    )
      continue;


    visited.add(url);



    const html =
      await fetchPage(url);



    if(!html)
      continue;



    pages.push(
      extractPageData(
        html,
        url
      )
    );



    const links =
      extractLinks(
        html,
        website
      );


    for(const link of links){

      if(
        !visited.has(link) &&
        queue.length < MAX_PAGES
      ){

        queue.push(link);

      }

    }

  }



  return {

    url:website,


    pages,


    metadata:{
      title:
        pages[0]?.title,

      description:
        pages[0]?.description,
    },


    extracted:{

      services:[],

      products:[],

      callsToAction:[],

      contacts:[],

      socialLinks:[],

    },


    summary:"",

  };

}