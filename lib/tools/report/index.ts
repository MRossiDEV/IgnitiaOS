import { ToolExecutor } from "@/lib/runtime/registry";

export const ReportTool: ToolExecutor = {
  name: "Report Generator",

  description: "Builds structured reports",

  version: "1.0.0",

  async execute({
    node,
    memory,
  }) {

    const report = {

      id: crypto.randomUUID(),

      type:
        node.config?.reportType ??
        "general",

      title:
        node.config?.title ??
        "AI Report",

      createdAt:
        new Date().toISOString(),

      summary:
        memory.getVariable("analysis"),

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

    const crawl =
      memory.getVariable("crawl");

    const page =
      memory.getVariable("page");

    const seo =
      memory.getVariable("seo");

    const ux =
      memory.getVariable("ux");

    const branding =
      memory.getVariable("branding");

    const accessibility =
      memory.getVariable("accessibility");

    const performance =
      memory.getVariable("performance");

    const security =
      memory.getVariable("security");

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
        memory.getVariable("trigger"),

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

    //------------------------------------------------
    // Save into Memory
    //------------------------------------------------

    memory.setVariable(

      "report",

      report

    );

    return report;

  },

};