

import Anthropic from "@anthropic-ai/sdk";

console.log(
  process.env.ANTHROPIC_API_KEY?.slice(0, 15)
);

export const aiconn = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,

  
});