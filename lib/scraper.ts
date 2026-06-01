// Core logic for extracting text from URLs and screenshots, and compiling prospect context for AI input

import { extract } from "@extractus/article-extractor";
import type { ProspectInput } from "@/db/schema";
import { logger } from "@/lib/logger";

const APPROX_CHARS_FOR_1500_TOKENS = 6000;
const DEFAULT_VISION_MODELS = ["openrouter/free", "nvidia/nemotron-nano-12b-v2-vl:free"];

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

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtmlTags(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

function cleanExtractedText(value: string): string {
  const stripped = stripHtmlTags(value);
  return normalizeWhitespace(stripped);
}

export function sanitizeTextContent(value: string): string {
  return cleanExtractedText(value);
}

function trimToTokenBudget(value: string): string {
  if (value.length <= APPROX_CHARS_FOR_1500_TOKENS) {
    return value;
  }
  return `${value.slice(0, APPROX_CHARS_FOR_1500_TOKENS)}...`;
}

function extractTextFromHtml(html: string): string {
  return cleanExtractedText(html);
}

async function extractFallbackText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  if (!response.ok) {
    throw new Error(`Fallback fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  const title = html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] ?? "";
  const description =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    "";
  const bodyText = extractTextFromHtml(html);

  return normalizeWhitespace([title, description, bodyText].filter(Boolean).join("\n"));
}

export async function extractFromUrl(url: string): Promise<string> {
  try {
    logger.info("scraper/url", "extract start", { url });

    const result = await extract(url);
    const rawText = result?.content ?? result?.description ?? "";
    let cleanText = cleanExtractedText(rawText);

    if (!cleanText) {
      logger.warn("scraper/url", "article extractor returned no text, using fallback", {
        url,
      });
      cleanText = await extractFallbackText(url);
    }

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

async function requestVisionExtraction(
  base64: string,
  mimeType: string,
  model: string,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is required");
  }

  logger.info("scraper/screenshot", "extract start", {
    model,
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
      model,
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
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const normalizedError = normalizeWhitespace(text);

    logger.error("scraper/screenshot", "extract failed", {
      model,
      status: response.status,
    });

    throw new Error(`Screenshot extraction failed: ${normalizedError}`);
  }

  const data = (await response.json()) as OpenRouterVisionResponse;
  const content = data.choices?.[0]?.message?.content ?? "";
  const normalized = cleanExtractedText(content);

  logger.info("scraper/screenshot", "extract success", {
    model,
    chars: normalized.length,
  });

  return normalized;
}

export async function extractFromScreenshot(
  base64: string,
  mimeType = "image/png",
): Promise<string> {
  const envVisionModel = process.env.VISION_MODEL?.trim();
  const visionModels = [
    envVisionModel || "",
    ...DEFAULT_VISION_MODELS,
  ].filter((model, index, all) => Boolean(model) && all.indexOf(model) === index);

  let lastError: unknown = null;

  for (const model of visionModels) {
    try {
      return await requestVisionExtraction(base64, mimeType, model);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);

      if (!message.includes("not a valid model ID")) {
        continue;
      }

      logger.warn("scraper/screenshot", "model rejected, trying fallback", {
        model,
      });
    }
  }

  logger.error(
    "scraper/screenshot",
    lastError instanceof Error ? lastError.message : "unknown extraction error",
    {
      modelsTried: visionModels.join(", "),
    },
  );

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error("Screenshot extraction failed");
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
