"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, type ConversationTurn } from "@/db/schema";
import { requireUserId } from "./auth";
import type { AddReplyInput } from "./types";

async function ensureOwnedMessage(messageId: string, userId: string) {
  const message = await db.query.messages.findFirst({
    where: (table, { and, eq: equals }) => and(equals(table.id, messageId), equals(table.userId, userId)),
  });

  if (!message) throw new Error("Message not found");
  return message;
}

export async function addReply(input: AddReplyInput) {
  const userId = await requireUserId();
  const message = await ensureOwnedMessage(input.messageId, userId);

  const existing = await db.query.conversations.findFirst({
    where: eq(conversations.messageId, input.messageId),
  });

  const nextTurn: ConversationTurn = {
    role: input.role,
    content: input.content.trim(),
    timestamp: new Date().toISOString(),
  };

  if (!existing) {
    const [created] = await db
      .insert(conversations)
      .values({ messageId: input.messageId, thread: [nextTurn] })
      .returning();

    revalidatePath(`/prospects/${message.prospectId}`);
    revalidatePath("/dashboard");
    return created;
  }

  const [updated] = await db
    .update(conversations)
    .set({ thread: [...existing.thread, nextTurn], updatedAt: new Date() })
    .where(eq(conversations.id, existing.id))
    .returning();

  revalidatePath(`/prospects/${message.prospectId}`);
  revalidatePath("/dashboard");
  return updated;
}
