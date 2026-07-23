// ======================================================
// IgnitiaOS Claude Client
// ======================================================

import Anthropic from "@anthropic-ai/sdk";

export const claude = new Anthropic({

    apiKey:
        process.env.ANTHROPIC_API_KEY,

});



export const DEFAULT_MODEL =
    "claude-3-5-sonnet-latest";



export const CHEAP_MODEL =
    "claude-3-5-haiku-latest";



export const PREMIUM_MODEL =
    "claude-3-opus-latest";