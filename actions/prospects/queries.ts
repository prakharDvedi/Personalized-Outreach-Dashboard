"use server";

import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { prospects } from "@/db/schema";
import { requireUserId } from "./auth";

export async function listProspects(search?: string) {
  const userId = await requireUserId();

  if (search?.trim()) {
    return db.query.prospects.findMany({
      where: and(
        eq(prospects.userId, userId),
        ilike(prospects.name, `%${search.trim()}%`),
      ),
      orderBy: [desc(prospects.createdAt)],
    });
  }

  return db.query.prospects.findMany({
    where: eq(prospects.userId, userId),
    orderBy: [desc(prospects.createdAt)],
  });
}

export async function getProspectById(prospectId: string) {
  const userId = await requireUserId();

  const prospect = await db.query.prospects.findFirst({
    where: and(eq(prospects.id, prospectId), eq(prospects.userId, userId)),
  });

  if (!prospect) {
    throw new Error("Prospect not found");
  }

  return prospect;
}
