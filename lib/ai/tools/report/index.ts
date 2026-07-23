import type { Tool } from "../types";

export const ReportTool: Tool = {
  name: "Report Generator",

  description: "Builds structured reports",

  async run(input) {

    const report = {

      id: crypto.randomUUID(),

      type:
        input.reportType ?? "general",

      title:
        input.title ?? "AI Report",

      createdAt:
        new Date().toISOString(),

      summary:
        input.analysis,

      sections: [] as Array<{
        id: string;
        title: string;
        content: unknown;
      }>,

      metadata: {},

        score: null as number | null,


    };

    //------------------------------------------------
    // Optional Inputs
    //------------------------------------------------

    const crawl = input.crawl;

    const page = input.page;

    const seo = input.seo;

    const ux = input.ux;

    const branding = input.branding;

    const accessibility = input.accessibility;

    const performance = input.performance;

    const security = input.security;

    //------------------------------------------------
    // Build Sections
    //------------------------------------------------

    if (crawl) {

      report.sections.push({

        id: "crawl",

        title: "Website Data",

        content: crawl,

      });

    }

    if (seo) {

      report.sections.push({

        id: "seo",

        title: "SEO",

        content: seo,

      });

    }

    if (performance) {

      report.sections.push({

        id: "performance",

        title: "Performance",

        content: performance,

      });

    }

    if (accessibility) {

      report.sections.push({

        id: "accessibility",

        title: "Accessibility",

        content: accessibility,

      });

    }

    if (branding) {

      report.sections.push({

        id: "branding",

        title: "Brand",

        content: branding,

      });

    }

    if (ux) {

      report.sections.push({

        id: "ux",

        title: "User Experience",

        content: ux,

      });

    }

    if (security) {

      report.sections.push({

        id: "security",

        title: "Security",

        content: security,

      });

    }

    //------------------------------------------------
    // Metadata
    //------------------------------------------------

    report.metadata = {

      pageTitle:
        page?.title,

      website:
        page?.url,

      generatedBy:
        "Ignitia AI",

      workflow:
        input.trigger,

      version: "1.0.0",

    };

    //------------------------------------------------
    // Overall Score
    //------------------------------------------------

    const scores = [

      seo?.score,

      ux?.score,

      branding?.score,

      accessibility?.score,

      performance?.score,

      security?.score,

    ].filter(
      (v) => typeof v === "number"
    );

    if (scores.length > 0) {

      report.score = Math.round(

        scores.reduce(

          (a, b) => a + b,

          0

        ) / scores.length

      );

    }

    return report;

  },

};
