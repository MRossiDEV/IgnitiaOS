
import Anthropic from "@anthropic-ai/sdk";

let _aiconn: Anthropic | null = null;

function getRequiredApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  }

  return apiKey;
}

export function getAIConn(): Anthropic {
  if (_aiconn) {
    return _aiconn;
  }

  _aiconn = new Anthropic({
    apiKey: getRequiredApiKey(),
  });

  return _aiconn;
}

// Keep existing imports working while deferring client creation to runtime use.
export const aiconn = new Proxy({} as Anthropic, {
  get(_target, prop, receiver) {
    return Reflect.get(getAIConn(), prop, receiver);
  },
});