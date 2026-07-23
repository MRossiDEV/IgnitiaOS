// ======================================================
// IgnitiaOS
// UX Specialist Definition
// ======================================================

import { uxPrompt } from "./prompt";
import { uxSchema } from "./schema";

export const uxDefinition = {

    id: "ux",

    name: "UX Specialist",

    description:
        "Analyzes usability, navigation, accessibility and user experience.",

    model:
        "claude-3-5-sonnet-latest",

    temperature: 0.2,

    prompt: uxPrompt,

    schema: uxSchema,

} as const;