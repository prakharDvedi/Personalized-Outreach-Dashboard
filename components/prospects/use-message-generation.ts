/// this hook manages the state and logic for generating AI messages based on the selected offering and prospect context. 
"use client";

import { useMemo, useState } from "react";
import { saveMessage } from "@/actions/messages";
import { buildSystemPrompt, DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import type { MessageItem, OfferingOption } from "./types";

type Params = {
  prospectId: string;
  extractedContext: string;
  offerings: OfferingOption[];
  userPrompt: string | null;
  initialMessages: MessageItem[];
};

export function useMessageGeneration({
  prospectId,
  extractedContext,
  offerings,
  userPrompt,
  initialMessages,
}: Params) {
  const [selectedOfferingId, setSelectedOfferingId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const selectedOffering = useMemo(
    () => offerings.find((item) => item.id === selectedOfferingId) ?? null,
    [offerings, selectedOfferingId],
  );

  const generate = async () => {
    if (!selectedOffering) {
      setError("Select an offering first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setStreamedText("");

    try {
      const system = buildSystemPrompt(
        userPrompt ?? DEFAULT_SYSTEM_PROMPT,
        selectedOffering.content,
      );

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.NEXT_PUBLIC_AI_MODEL || undefined,
          system,
          messages: [
            {
              role: "user",
              content: extractedContext || "No prospect context provided yet.",
            },
          ],
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Generation failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let output = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        output += decoder.decode(value, { stream: true });
        setStreamedText(output);
      }

      const messageContent = output.trim();
      if (!messageContent) {
        throw new Error("Model returned an empty message.");
      }

      const saved = await saveMessage({
        prospectId,
        offeringId: selectedOffering.id,
        content: messageContent,
      });

      setMessages((prev) => [
        {
          id: saved.id,
          content: saved.content,
          rating: saved.rating,
          isFavourite: saved.isFavourite,
        },
        ...prev,
      ]);

      setStreamedText("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    selectedOfferingId,
    setSelectedOfferingId,
    selectedOffering,
    isGenerating,
    streamedText,
    error,
    messages,
    setMessages,
    generate,
  };
}
