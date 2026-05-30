// this is the offering detail page where users can edit their offering briefs and import content from URLs

import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { offerings } from "@/db/schema";
import { auth } from "@/lib/auth";
import { extractFromUrl } from "@/lib/scraper";

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
      <p className="mt-1 text-sm text-gray-600">
        Import source material, then edit it into your final offering brief.
      </p>

      <section className="mt-6 rounded-xl border border-gray-200 p-4">
        <form action={importFromUrlAction} className="flex gap-2">
          <input type="hidden" name="id" value={offering.id} />
          <input
            name="url"
            type="url"
            required
            defaultValue={offering.sourceUrl ?? ""}
            placeholder="https://your-site.com/offering-page"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-gray-500 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Import from URL
          </button>
        </form>
      </section>

      <section className="mt-4 rounded-xl border border-gray-200 p-4">
        <form action={saveOfferingAction} className="grid gap-3">
          <input type="hidden" name="id" value={offering.id} />
          <input
            name="name"
            required
            defaultValue={offering.name}
            placeholder="Offering name"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-gray-500 focus:ring-2"
          />
          <input
            name="sourceUrl"
            defaultValue={offering.sourceUrl ?? ""}
            placeholder="Source URL (optional)"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-gray-500 focus:ring-2"
          />
          <textarea
            name="content"
            required
            rows={14}
            defaultValue={offering.content}
            placeholder="Main offering content"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-gray-500 focus:ring-2"
          />
          <button
            type="submit"
            className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Save
          </button>
        </form>
      </section>
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