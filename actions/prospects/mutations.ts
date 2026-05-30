"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { prospects, type ProspectInput } from "@/db/schema";
import { compileProspectContext } from "@/lib/scraper";
import { requireUserId } from "./auth";
import type {
  AddProspectInputPayload,
  CreateProspectInput,
  UpdateProspectContextPayload,
} from "./types";

export async function createProspect(input: CreateProspectInput) {
  const userId = await requireUserId();

  const [created] = await db
    .insert(prospects)
    .values({
      userId,
      name: input.name.trim(),
      extractedContext: "",
      inputs: [],
    })
    .returning();

  revalidatePath("/prospects");
  return created;
}

export async function addInput(payload: AddProspectInputPayload) {
  const userId = await requireUserId();

  const current = await db.query.prospects.findFirst({
    where: and(
      eq(prospects.id, payload.prospectId),
      eq(prospects.userId, userId),
    ),
  });

  if (!current) {
    throw new Error("Prospect not found");
  }

  const nextInputs: ProspectInput[] = [...current.inputs, payload.input];
  const nextContext = compileProspectContext(nextInputs);

  const [updated] = await db
    .update(prospects)
    .set({
      inputs: nextInputs,
      extractedContext: nextContext,
    })
    .where(
      and(eq(prospects.id, payload.prospectId), eq(prospects.userId, userId)),
    )
    .returning();

  revalidatePath("/prospects");
  revalidatePath(`/prospects/${payload.prospectId}`);
  return updated;
}

export async function updateContext(payload: UpdateProspectContextPayload) {
  const userId = await requireUserId();

  const [updated] = await db
    .update(prospects)
    .set({
      extractedContext: payload.extractedContext.trim(),
    })
    .where(
      and(eq(prospects.id, payload.prospectId), eq(prospects.userId, userId)),
    )
    .returning();

  if (!updated) {
    throw new Error("Prospect not found");
  }

  revalidatePath(`/prospects/${payload.prospectId}`);
  return updated;
}
