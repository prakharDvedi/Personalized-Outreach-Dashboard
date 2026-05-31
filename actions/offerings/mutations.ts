"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { offerings } from "@/db/schema";
import { logger } from "@/lib/logger";
import { extractFromUrl } from "@/lib/scraper";
import { requireUserId } from "./auth";
import type { OfferingInput } from "./types";

export async function createOffering(input: OfferingInput) {
  const userId = await requireUserId();
  logger.info("actions/offerings", "create start", { name: input.name.trim() });

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
  logger.info("actions/offerings", "create success", { offeringId: created.id });
  return created;
}

export async function updateOffering(id: string, input: OfferingInput) {
  const userId = await requireUserId();
  logger.info("actions/offerings", "update start", { offeringId: id });

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

  if (!updated) throw new Error("Offering not found");

  revalidatePath("/offerings");
  revalidatePath(`/offerings/${id}`);
  logger.info("actions/offerings", "update success", { offeringId: id });
  return updated;
}

export async function deleteOffering(id: string) {
  const userId = await requireUserId();
  logger.info("actions/offerings", "delete start", { offeringId: id });

  const [deleted] = await db
    .delete(offerings)
    .where(and(eq(offerings.id, id), eq(offerings.userId, userId)))
    .returning({ id: offerings.id });

  if (!deleted) throw new Error("Offering not found");

  revalidatePath("/offerings");
  logger.info("actions/offerings", "delete success", { offeringId: id });
  return deleted.id;
}

export type ImportOfferingFromUrlState = {
  error: string | null;
  sourceUrl: string;
  content: string;
  success: boolean;
  nonce: number;
};

const initialImportState: ImportOfferingFromUrlState = {
  error: null,
  sourceUrl: "",
  content: "",
  success: false,
  nonce: 0,
};

function failImport(message: string): ImportOfferingFromUrlState {
  return { ...initialImportState, error: message };
}

function succeedImport(sourceUrl: string, content: string): ImportOfferingFromUrlState {
  return {
    error: null,
    sourceUrl,
    content,
    success: true,
    nonce: Date.now(),
  };
}

export async function importOfferingFromUrl(
  _prevState: ImportOfferingFromUrlState,
  formData: FormData,
): Promise<ImportOfferingFromUrlState> {
  try {
    const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();

    if (!sourceUrl) {
      return failImport("Add a URL first.");
    }

    logger.info("actions/offerings", "import start", { sourceUrl });

    const content = await extractFromUrl(sourceUrl);

    if (!content.trim()) {
      return failImport("No readable content could be extracted from that URL.");
    }

    logger.info("actions/offerings", "import success", {
      sourceUrl,
      chars: content.length,
    });

    return succeedImport(sourceUrl, content);
  } catch (error) {
    logger.error(
      "actions/offerings",
      error instanceof Error ? error.message : "unknown import failure",
    );

    return failImport(
      error instanceof Error ? error.message : "Failed to import URL",
    );
  }
}
