// ======================================================
// IgnitiaOS
// Content Specialist Definition
// ======================================================

import { contentPrompt } from "./prompt";
import { contentSchema } from "./schema";

export const contentDefinition = {

    id: "content",

    name: "Content Specialist",

    description:
        "Analyzes website content quality, clarity, engagement and trust.",

    model:
        "claude-3-5-sonnet-latest",

    temperature: 0.2,

    prompt: contentPrompt,

    schema: contentSchema,

} as const;