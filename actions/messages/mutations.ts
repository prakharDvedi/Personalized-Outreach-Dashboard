"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireUserId } from "./auth";
import type {
  RateMessageInput,
  SaveMessageInput,
  ToggleFavouriteInput,
} from "./types";

export async function saveMessage(input: SaveMessageInput) {
  const userId = await requireUserId();

  const [created] = await db
    .insert(messages)
    .values({
      userId,
      prospectId: input.prospectId,
      offeringId: input.offeringId,
      content: input.content.trim(),
    })
    .returning();

  revalidatePath(`/prospects/${input.prospectId}`);
  revalidatePath("/dashboard");
  return created;
}

export async function rateMessage(input: RateMessageInput) {
  const userId = await requireUserId();

  if (input.rating !== null && (input.rating < 1 || input.rating > 5)) {
    throw new Error("Rating must be between 1 and 5");
  }

  const [updated] = await db
    .update(messages)
    .set({ rating: input.rating })
    .where(and(eq(messages.id, input.messageId), eq(messages.userId, userId)))
    .returning();

  if (!updated) throw new Error("Message not found");

  revalidatePath(`/prospects/${updated.prospectId}`);
  revalidatePath("/dashboard");
  return updated;
}

export async function toggleFavourite(input: ToggleFavouriteInput) {
  const userId = await requireUserId();

  const [updated] = await db
    .update(messages)
    .set({ isFavourite: input.isFavourite })
    .where(and(eq(messages.id, input.messageId), eq(messages.userId, userId)))
    .returning();

  if (!updated) throw new Error("Message not found");

  revalidatePath(`/prospects/${updated.prospectId}`);
  revalidatePath("/dashboard");
  return updated;
}

export async function deleteMessage(messageId: string) {
  const userId = await requireUserId();

  const [deleted] = await db
    .delete(messages)
    .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
    .returning({ id: messages.id, prospectId: messages.prospectId });

  if (!deleted) throw new Error("Message not found");

  revalidatePath(`/prospects/${deleted.prospectId}`);
  revalidatePath("/dashboard");
  return deleted.id;
}
