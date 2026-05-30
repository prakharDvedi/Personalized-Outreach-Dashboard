// this is the offering detail page where users can edit their offering briefs and import content from URLs

import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { offerings } from "@/db/schema";
import { auth } from "@/lib/auth";
import { extractFromUrl } from "@/lib/scraper";
import { OfferingImportForm } from "@/components/offerings/offering-import-form";
import { OfferingEditForm } from "@/components/offerings/offering-edit-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OfferingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const offering = await db.query.offerings.findFirst({
    where: and(eq(offerings.id, id), eq(offerings.userId, userId)),
  });

  if (!offering) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold">Edit offering</h1>
      <p className="mt-1 text-sm text-white/80">
        Import source material, then edit it into your final offering brief.
      </p>

      <OfferingImportForm
        action={importFromUrlAction}
        offeringId={offering.id}
        defaultValue={offering.sourceUrl}
      />

      <OfferingEditForm
        action={saveOfferingAction}
        offeringId={offering.id}
        name={offering.name}
        sourceUrl={offering.sourceUrl}
        content={offering.content}
      />
    </main>
  );
}

async function importFromUrlAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!id || !url) return;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return;

  const existing = await db.query.offerings.findFirst({
    where: and(eq(offerings.id, id), eq(offerings.userId, userId)),
  });

  if (!existing) return;

  const extracted = await extractFromUrl(url);

  await db
    .update(offerings)
    .set({
      sourceUrl: url,
      content: extracted || existing.content,
      updatedAt: new Date(),
    })
    .where(and(eq(offerings.id, id), eq(offerings.userId, userId)));

  revalidatePath("/offerings");
  revalidatePath(`/offerings/${id}`);
}

async function saveOfferingAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sourceUrlRaw = String(formData.get("sourceUrl") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!id || !name || !content) return;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return;

  await db
    .update(offerings)
    .set({
      name,
      sourceUrl: sourceUrlRaw || null,
      content,
      updatedAt: new Date(),
    })
    .where(and(eq(offerings.id, id), eq(offerings.userId, userId)));

  revalidatePath("/offerings");
  revalidatePath(`/offerings/${id}`);
}
