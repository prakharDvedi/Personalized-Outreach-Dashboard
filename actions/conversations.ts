// Server actions for managing conversations (get thread, add reply)
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { conversations, messages, type ConversationTurn } from "@/db/schema";
import { auth } from "@/lib/auth";

type AddReplyInput = {
  messageId: string;
  role: "assistant" | "user";
  content: string;
};

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

async function ensureOwnedMessage(messageId: string, userId: string) {
  const message = await db.query.messages.findFirst({
    where: and(eq(messages.id, messageId), eq(messages.userId, userId)),
  });

  if (!message) {
    throw new Error("Message not found");
  }

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
      .values({
        messageId: input.messageId,
        thread: [nextTurn],
      })
      .returning();

    revalidatePath(`/prospects/${message.prospectId}`);
    revalidatePath("/dashboard");
    return created;
  }

  const [updated] = await db
    .update(conversations)
    .set({
      thread: [...existing.thread, nextTurn],
      updatedAt: new Date(),
    })
    .where(eq(conversations.id, existing.id))
    .returning();

  revalidatePath(`/prospects/${message.prospectId}`);
  revalidatePath("/dashboard");
  return updated;
}