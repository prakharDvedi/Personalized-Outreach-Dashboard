// Core logic for extracting text from URLs and screenshots, and compiling prospect context for AI input

import { extract } from "@extractus/article-extractor";
import type { ProspectInput } from "@/db/schema";
import { logger } from "@/lib/logger";

const APPROX_CHARS_FOR_1500_TOKENS = 6000;

type OpenRouterVisionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function trimToTokenBudget(value: string): string {
  if (value.length <= APPROX_CHARS_FOR_1500_TOKENS) {
    return value;
  }
  return `${value.slice(0, APPROX_CHARS_FOR_1500_TOKENS)}...`;
}

export async function extractFromUrl(url: string): Promise<string> {
  try {
    logger.info("scraper/url", "extract start", { url });

    const result = await extract(url);
    const rawText = result?.content ?? result?.description ?? "";
    const cleanText = normalizeWhitespace(rawText);

    if (!cleanText) {
      logger.warn("scraper/url", "no text extracted", { url });
      return "";
    }

    logger.info("scraper/url", "extract success", {
      url,
      chars: cleanText.length,
    });
    return trimToTokenBudget(cleanText);
  } catch (err: unknown) {
    logger.error(
      "scraper/url",
      err instanceof Error ? err.message : "unknown extraction error",
      { url },
    );
    throw err;
  }
}

export async function extractFromScreenshot(base64: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required");
  }

  const visionModel =
    process.env.VISION_MODEL ?? process.env.AI_MODEL ?? "deepseek/deepseek-v3-0324:free";

  try {
    logger.info("scraper/screenshot", "extract start", {
      model: visionModel,
      base64Chars: base64.length,
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
        "X-Title": "Kakiyo Outreach",
      },
      body: JSON.stringify({
        model: visionModel,
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "Extract outreach-relevant details from this screenshot. Return only structured plain text under headings: Person, Role, Company, Current Work, Signals, Conversation Hooks.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Read this screenshot and extract concise facts useful for writing personalized cold outreach.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${base64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error("scraper/screenshot", "extract failed", {
        model: visionModel,
        status: response.status,
      });
      throw new Error(`Screenshot extraction failed: ${text}`);
    }

    const data = (await response.json()) as OpenRouterVisionResponse;
    const content = data.choices?.[0]?.message?.content ?? "";
    const normalized = normalizeWhitespace(content);

    logger.info("scraper/screenshot", "extract success", {
      model: visionModel,
      chars: normalized.length,
    });

    return normalized;
  } catch (err: unknown) {
    logger.error(
      "scraper/screenshot",
      err instanceof Error ? err.message : "unknown extraction error",
      { model: visionModel },
    );
    throw err;
  }
}

export function compileProspectContext(inputs: ProspectInput[]): string {
  if (inputs.length === 0) {
    return "No prospect context provided yet.";
  }

  const sections = inputs.map((input, index) => {
    const title = input.type.replaceAll("_", " ").toUpperCase();
    const source = input.rawValue.trim() || "N/A";
    const extracted = input.extractedText.trim() || "No extracted text.";

    return [
      `### Source ${index + 1}: ${title}`,
      `Raw: ${source}`,
      `Extracted: ${extracted}`,
    ].join("\n");
  });

  return sections.join("\n\n");
}
