// Server actions for managing offerings (create, update, delete, list)
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { offerings } from "@/db/schema";
import { auth } from "@/lib/auth";

type OfferingInput = {
  name: string;
  content: string;
  sourceUrl?: string | null;
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

export async function listOfferings() {
  const userId = await requireUserId();

  return db.query.offerings.findMany({
    where: eq(offerings.userId, userId),
    orderBy: [desc(offerings.updatedAt)],
  });
}

export async function createOffering(input: OfferingInput) {
  const userId = await requireUserId();

  const [created] = await db
    .insert(offerings)
    .values({
      userId,
      name: input.name.trim(),
      content: input.content.trim(),
      sourceUrl: input.sourceUrl?.trim() || null,
    })
    .returning();

  revalidatePath("/offerings");
  return created;
}

export async function updateOffering(id: string, input: OfferingInput) {
  const userId = await requireUserId();

  const [updated] = await db
    .update(offerings)
    .set({
      name: input.name.trim(),
      content: input.content.trim(),
      sourceUrl: input.sourceUrl?.trim() || null,
      updatedAt: new Date(),
    })
    .where(and(eq(offerings.id, id), eq(offerings.userId, userId)))
    .returning();

  if (!updated) {
    throw new Error("Offering not found");
  }

  revalidatePath("/offerings");
  revalidatePath(`/offerings/${id}`);
  return updated;
}

export async function deleteOffering(id: string) {
  const userId = await requireUserId();

  const [deleted] = await db
    .delete(offerings)
    .where(and(eq(offerings.id, id), eq(offerings.userId, userId)))
    .returning({ id: offerings.id });

  if (!deleted) {
    throw new Error("Offering not found");
  }

  revalidatePath("/offerings");
  return deleted.id;
}