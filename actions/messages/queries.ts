"use server";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireUserId } from "./auth";

export async function listMessagesByProspect(prospectId: string) {
  const userId = await requireUserId();

  return db.query.messages.findMany({
    where: and(eq(messages.userId, userId), eq(messages.prospectId, prospectId)),
    orderBy: [desc(messages.createdAt)],
  });
}
