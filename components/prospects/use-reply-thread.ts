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
  const [threadByMessage, setThreadByMessage] = useState<Record<string, ConversationTurn[]>>({});
  const [replyError, setReplyError] = useState("");

  const openReplyComposer = async (messageId: string) => {
    setReplyError("");
    setOpenReplyFor(messageId);
    setReplyDraft("");

    if (threadByMessage[messageId]?.length) {
      return;
    }

    const existing = await getThread(messageId);
    setThreadByMessage((prev) => ({ ...prev, [messageId]: existing }));
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
      const existingThread = threadByMessage[messageId] ?? [];
      const baseThread =
        existingThread.length > 0
          ? existingThread
          : [{ role: "assistant" as const, content: originalMessage, timestamp: "" }];

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
            ...baseThread.map((turn) => ({ role: turn.role, content: turn.content })),
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

      const canonicalThread = await getThread(messageId);
      setThreadByMessage((prev) => ({ ...prev, [messageId]: canonicalThread }));
      setReplyDraft("");
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : "Follow-up generation failed");
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
