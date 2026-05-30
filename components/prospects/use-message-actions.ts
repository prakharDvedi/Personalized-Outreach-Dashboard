// this is a client component because it uses useState and interacts with clipboard

"use client";

import { useState } from "react";
import {
  deleteMessage,
  rateMessage,
  toggleFavourite,
} from "@/actions/messages";
import type { MessageItem } from "./types";

export function useMessageActions(
  messages: MessageItem[],
  setMessages: React.Dispatch<React.SetStateAction<MessageItem[]>>,
) {
  const [actionError, setActionError] = useState("");

  const copyMessageAction = async (content: string) => {
    setActionError("");
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      setActionError("Failed to copy message.");
    }
  };

  const rateMessageAction = async (messageId: string, rating: number) => {
    setActionError("");
    try {
      await rateMessage({ messageId, rating });
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, rating } : m)),
      );
    } catch {
      setActionError("Failed to update rating.");
    }
  };

  const toggleFavouriteAction = async (messageId: string, isFavourite: boolean) => {
    setActionError("");
    try {
      await toggleFavourite({ messageId, isFavourite });
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isFavourite } : m)),
      );
    } catch {
      setActionError("Failed to update favourite.");
    }
  };

  const deleteMessageAction = async (messageId: string) => {
    setActionError("");
    try {
      await deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {
      setActionError("Failed to delete message.");
    }
  };

  return {
    actionError,
    copyMessageAction,
    rateMessageAction,
    toggleFavouriteAction,
    deleteMessageAction,
  };
}