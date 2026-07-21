import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const STYLE_AI_MODEL = "claude-opus-4-8";
// Fast/cheap model for small, latency-sensitive helper calls (e.g.
// turning an analysis into a few search-query strings) — not the main
// vision analysis.
export const FAST_MODEL = "claude-haiku-4-5";
