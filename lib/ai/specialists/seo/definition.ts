// ======================================================
// IgnitiaOS
// SEO Specialist Definition
// ======================================================

import { seoPrompt } from "./prompt";
import { seoSchema } from "./schema";

export const seoDefinition = {

    id: "seo",

    name: "SEO Specialist",

    description:
        "Analyzes website SEO opportunities.",

    model:
        "claude-3-5-sonnet-latest",

    temperature: 0.2,

    prompt: seoPrompt,

    schema: seoSchema,

} as const;