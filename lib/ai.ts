// Core AI interaction logic, including streaming responses from OpenRouter

type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

type GenerateStreamParams = {
  system: string;
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

type OpenRouterChunk = {
  choices?: Array<{
    delta?: {
      content?: string;
    };
    finish_reason?: string | null;
  }>;
};

const DEFAULT_MODEL = "openrouter/owl-alpha";
const DEFAULT_TEMPERATURE = 0.85;
const DEFAULT_MAX_TOKENS = 400;

function toOpenRouterMessages(
  system: string,
  messages: ChatMessage[],
): Array<{ role: ChatRole; content: string }> {
  return [{ role: "system", content: system }, ...messages];
}

export async function generateMessageStream({
  system,
  messages,
  model = process.env.AI_MODEL ?? DEFAULT_MODEL,
  temperature = DEFAULT_TEMPERATURE,
  maxTokens = DEFAULT_MAX_TOKENS,
}: GenerateStreamParams): Promise<Response> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is required");
  }

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
      temperature,
      max_tokens: maxTokens,
      stream: true,
      messages: toOpenRouterMessages(system, messages),
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(`OpenRouter request failed: ${errorText}`);
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = response.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) {
              continue;
            }

            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") {
              continue;
            }

            let parsed: OpenRouterChunk;
            try {
              parsed = JSON.parse(data) as OpenRouterChunk;
            } catch {
              continue;
            }

            const token = parsed.choices?.[0]?.delta?.content;
            if (token) {
              controller.enqueue(encoder.encode(token));
            }
          }
        }
      } catch (err: unknown) {
        controller.error(err);
      } finally {
        controller.close();
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
