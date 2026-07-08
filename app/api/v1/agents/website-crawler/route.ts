import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "Missing reportId" },
        { status: 400 }
      );
    }

    const { data: report } = await supabaseAdmin
      .from("reports")
      .select("id,business_website")
      .eq("id", reportId)
      .single();

    if (!report)
      throw new Error("Report not found");

    let url = report.business_website;

    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 Ignitia AI Audit Bot",
      },
    });

    const html = await response.text();

    const $ = cheerio.load(html);

    const title = $("title").text().trim();

    const description =
      $('meta[name="description"]').attr("content") ??
      "";

    const h1 = $("h1")
      .map((_, el) => $(el).text())
      .get();

    const h2 = $("h2")
      .map((_, el) => $(el).text())
      .get();

    const images = $("img")
      .map((_, el) => ({
        src: $(el).attr("src"),
        alt: $(el).attr("alt"),
      }))
      .get();

    const links = $("a")
      .map((_, el) => ({
        href: $(el).attr("href"),
        text: $(el).text().trim(),
      }))
      .get();

    const scripts = $("script[src]")
      .map((_, el) => $(el).attr("src"))
      .get();

    const stylesheets = $('link[rel="stylesheet"]')
      .map((_, el) => $(el).attr("href"))
      .get();

    const meta = $("meta")
      .map((_, el) => ({
        name:
          $(el).attr("name") ??
          $(el).attr("property"),
        content: $(el).attr("content"),
      }))
      .get();

    const technologies: string[] = [];

    if (html.includes("__NEXT_DATA__"))
      technologies.push("Next.js");

    if (html.includes("wp-content"))
      technologies.push("WordPress");

    if (html.includes("shopify"))
      technologies.push("Shopify");

    if (html.includes("wix"))
      technologies.push("Wix");

    if (html.includes("webflow"))
      technologies.push("Webflow");

    if (html.includes("elementor"))
      technologies.push("Elementor");

    const data = {
      homepage_title: title,

      homepage_description: description,

      website_html: html,

      pages: [
        {
          url,
          title,
        },
      ],

      metadata: {
        meta,
        h1,
        h2,
      },

      technologies,

      headers: Object.fromEntries(
        response.headers.entries()
      ),
    };

    await supabaseAdmin
      .from("report_sources")
      .upsert({
        report_id: reportId,
        ...data,
        updated_at: new Date(),
      });

    return NextResponse.json({
      success: true,
      crawled: true,
      pages: 1,
      technologies,
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      {
        status: 500,
      }
    );
  }
}