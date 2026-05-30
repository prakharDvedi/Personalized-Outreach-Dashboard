"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { offerings } from "@/db/schema";
import { requireUserId } from "./auth";

export async function listOfferings() {
  const userId = await requireUserId();

  return db.query.offerings.findMany({
    where: eq(offerings.userId, userId),
    orderBy: [desc(offerings.updatedAt)],
  });
}
