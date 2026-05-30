// API route for generating AI messages based on system prompt

import { NextResponse } from "next/server";
import { generateMessageStream, type ChatMessage } from "@/lib/ai";

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
  try {
    const body = (await request.json()) as Partial<GenerateRequestBody>;

    if (typeof body.system !== "string" || !body.system.trim()) {
      return NextResponse.json(
        { error: "Missing required field: system" },
        { status: 400 },
      );
    }

    if (!isValidMessageArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid field: messages" },
        { status: 400 },
      );
    }

    const streamResponse = await generateMessageStream({
      system: body.system,
      messages: body.messages,
      model: body.model,
    });

    return streamResponse;
  } catch (err: unknown) {
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