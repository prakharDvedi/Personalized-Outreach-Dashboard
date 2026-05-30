// Server actions for managing prospects (create, update context, add input, list, get by id)
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { prospects, type ProspectInput } from "@/db/schema";
import { auth } from "@/lib/auth";
import { compileProspectContext } from "@/lib/scraper";

type CreateProspectInput = {
  name: string;
};

type AddProspectInputPayload = {
  prospectId: string;
  input: ProspectInput;
};

type UpdateProspectContextPayload = {
  prospectId: string;
  extractedContext: string;
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
    .where(and(eq(prospects.id, payload.prospectId), eq(prospects.userId, userId)))
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
    .where(and(eq(prospects.id, payload.prospectId), eq(prospects.userId, userId)))
    .returning();

  if (!updated) {
    throw new Error("Prospect not found");
  }

  revalidatePath(`/prospects/${payload.prospectId}`);
  return updated;
}