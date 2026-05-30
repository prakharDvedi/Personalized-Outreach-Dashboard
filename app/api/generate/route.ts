// API route for generating AI messages based on system prompt

import { NextResponse } from "next/server";
import { generateMessageStream, type ChatMessage } from "@/lib/ai";
import { logger } from "@/lib/logger";

type GenerateRequestBody = {
  system: string;
  messages: ChatMessage[];
  model?: string;
};

function isValidMessageArray(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every((entry) => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    const candidate = entry as Partial<ChatMessage>;
    const validRole =
      candidate.role === "system" ||
      candidate.role === "user" ||
      candidate.role === "assistant";

    return validRole && typeof candidate.content === "string";
  });
}

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const body = (await request.json()) as Partial<GenerateRequestBody>;

    if (typeof body.system !== "string" || !body.system.trim()) {
      logger.warn("api/generate", "missing system prompt");
      return NextResponse.json(
        { error: "Missing required field: system" },
        { status: 400 },
      );
    }

    if (!isValidMessageArray(body.messages) || body.messages.length === 0) {
      logger.warn("api/generate", "invalid messages payload");
      return NextResponse.json(
        { error: "Missing or invalid field: messages" },
        { status: 400 },
      );
    }

    logger.info("api/generate", "request accepted", {
      model: body.model ?? process.env.AI_MODEL ?? "openrouter/owl-alpha",
      messageCount: body.messages.length,
      systemLength: body.system.length,
    });

    const streamResponse = await generateMessageStream({
      system: body.system,
      messages: body.messages,
      model: body.model,
    });

    logger.info("api/generate", "stream started", {
      durationMs: Date.now() - startedAt,
    });

    return streamResponse;
  } catch (err: unknown) {
    logger.error("api/generate", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to generate message",
      },
      { status: 500 },
    );
  }
}
