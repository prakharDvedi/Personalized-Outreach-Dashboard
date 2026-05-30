"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages, type ConversationTurn } from "@/db/schema";
import { requireUserId } from "./auth";

async function ensureOwnedMessage(messageId: string, userId: string) {
  const message = await db.query.messages.findFirst({
    where: and(eq(messages.id, messageId), eq(messages.userId, userId)),
  });

  if (!message) throw new Error("Message not found");
  return message;
}

export async function getThread(messageId: string): Promise<ConversationTurn[]> {
  const userId = await requireUserId();
  await ensureOwnedMessage(messageId, userId);

  const row = await db.query.conversations.findFirst({
    where: eq(conversations.messageId, messageId),
  });

  return row?.thread ?? [];
}
