// this hook manages the state and logic for the reply thread UI in the prospect detail page. 
// It handles opening the reply composer, generating follow-up messages using the AI, 
// and maintaining the conversation thread state for each message. 
// It also manages loading and error states for the reply generation process.

"use client";

import { useState } from "react";
import { addReply, getThread } from "@/actions/conversations";
import { buildSystemPrompt, DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import type { ConversationTurn, OfferingOption } from "./types";

type Params = {
  selectedOffering: OfferingOption | null;
  userPrompt: string | null;
};

export function useReplyThread({ selectedOffering, userPrompt }: Params) {
  const [openReplyFor, setOpenReplyFor] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyLoadingFor, setReplyLoadingFor] = useState<string | null>(null);
  const [threadByMessage, setThreadByMessage] = useState<
    Record<string, ConversationTurn[]>
  >({});
  const [replyError, setReplyError] = useState("");

  const openReplyComposer = async (messageId: string, originalMessage: string) => {
    setReplyError("");
    setOpenReplyFor(messageId);
    setReplyDraft("");

    if (threadByMessage[messageId]?.length) {
      return;
    }

    const existing = await getThread(messageId);
    if (existing.length > 0) {
      setThreadByMessage((prev) => ({ ...prev, [messageId]: existing }));
      return;
    }

    setThreadByMessage((prev) => ({
      ...prev,
      [messageId]: [
        {
          role: "assistant",
          content: originalMessage,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  };

  const generateFollowUp = async (messageId: string, originalMessage: string) => {
    if (!replyDraft.trim()) {
      setReplyError("Paste the prospect reply first.");
      return;
    }

    if (!selectedOffering) {
      setReplyError("Select an offering first.");
      return;
    }

    setReplyLoadingFor(messageId);
    setReplyError("");

    try {
      const baseThread = threadByMessage[messageId] ?? [
        {
          role: "assistant" as const,
          content: originalMessage,
          timestamp: new Date().toISOString(),
        },
      ];

      const prospectReply = replyDraft.trim();
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
            ...baseThread.map((turn) => ({
              role: turn.role,
              content: turn.content,
            })),
            {
              role: "user",
              content: `The prospect replied: ${prospectReply}\nGenerate a contextual follow-up that continues naturally.`,
            },
          ],
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error ?? "Follow-up generation failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let followUpText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        followUpText += decoder.decode(value, { stream: true });
      }

      const followUp = followUpText.trim();
      if (!followUp) {
        throw new Error("Model returned an empty follow-up.");
      }

      await addReply({ messageId, role: "user", content: prospectReply });
      await addReply({ messageId, role: "assistant", content: followUp });

      setThreadByMessage((prev) => ({
        ...prev,
        [messageId]: [
          ...baseThread,
          {
            role: "user",
            content: prospectReply,
            timestamp: new Date().toISOString(),
          },
          {
            role: "assistant",
            content: followUp,
            timestamp: new Date().toISOString(),
          },
        ],
      }));

      setReplyDraft("");
    } catch (err: unknown) {
      setReplyError(
        err instanceof Error ? err.message : "Follow-up generation failed",
      );
    } finally {
      setReplyLoadingFor(null);
    }
  };

  return {
    openReplyFor,
    replyDraft,
    setReplyDraft,
    replyLoadingFor,
    threadByMessage,
    replyError,
    openReplyComposer,
    generateFollowUp,
  };
}