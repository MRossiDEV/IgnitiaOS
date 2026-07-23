// ======================================================
// IgnitiaOS
// AI Provider Export
// ======================================================

import { AIProvider } from "@/lib/ai/provider/aiProvider";
import { AnthropicProvider } from "./anthropicProvider";


export const aiProvider: AIProvider =
    new AnthropicProvider();