// Core scraping and context compilation logic for outreach

import { extract } from "@extractus/article-extractor";
import type { ProspectInput } from "@/db/schema";

const APPROX_TOKEN_CHAR_LIMIT = 6000;

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function trimToTokenBudget(
  value: string,
  maxChars = APPROX_TOKEN_CHAR_LIMIT,
): string {
  if (value.length <= maxChars) {
    return value;
  }
  return `${value.slice(0, maxChars)}...`;
}

export async function extractFromUrl(url: string): Promise<string> {
  const result = await extract(url);
  const content = normalizeText(result?.content ?? result?.description ?? "");

  if (!content) {
    return "";
  }

  return trimToTokenBudget(content);
}

export async function extractFromScreenshot(base64: string): Promise<string> {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY ?? ""}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
        "X-Title": "Kakiyo Outreach",
      },
      body: JSON.stringify({
        model:
          process.env.VISION_MODEL ||
          process.env.AI_MODEL ||
          "deepseek/deepseek-v3-0324:free",
        temperature: 0.2,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              "Extract useful outreach context from this screenshot. Return concise bullets under headings: Person, Role, Company, Recent Signals, Topics to Mention.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract context for personalized outreach. Ignore UI chrome and irrelevant elements.",
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
    },
  );

  if (!response.ok) {
    throw new Error("Screenshot extraction failed");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content ?? "";
  return normalizeText(content);
}

export function compileProspectContext(inputs: ProspectInput[]): string {
  const sections = inputs
    .map((input, index) => {
      const label = `${index + 1}. ${input.type.replaceAll("_", " ").toUpperCase()}`;
      const source = input.rawValue.trim();
      const extracted = input.extractedText.trim();

      return [
        `### ${label}`,
        `Source: ${source || "N/A"}`,
        `Context: ${extracted || "No extracted context available."}`,
      ].join("\n");
    })
    .filter(Boolean);

  if (sections.length === 0) {
    return "No prospect context provided yet.";
  }

  return sections.join("\n\n");
}
