// this is the main page for managing offerings.
import Link from "next/link";
import { createOffering, listOfferings } from "@/actions/offerings";

export default async function OfferingsPage() {
  const offeringList = await listOfferings();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Offerings</h1>
          <p className="mt-1 text-sm text-white/80">
            Save what you sell so message generation stays grounded.
          </p>
        </div>
      </header>

      <section className="mb-8 rounded-xl border border-white-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
          Create offering
        </h2>
        <form action={createOfferingAction} className="mt-4 grid gap-3">
          <input
            name="name"
            required
            placeholder="Offering name"
            className="rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
          />
          <textarea
            name="content"
            required
            rows={5}
            placeholder="What do you offer? Keep it practical and clear."
            className="rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
          />
          <button
            type="submit"
            className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-white-800"
          >
            Create
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {offeringList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white-300 p-6 text-sm text-white/80">
            No offerings yet. Create your first offering above
          </div>
        ) : (
          offeringList.map((offering) => (
            <article
              key={offering.id}
              className="rounded-xl border border-white-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold">{offering.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-white/80">
                    {offering.content}
                  </p>
                </div>
                <Link
                  href={`/offerings/${offering.id}`}
                  className="rounded-md border border-white-300 px-3 py-1.5 text-xs font-medium hover:bg-white-50"
                >
                  Edit
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

async function createOfferingAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "");
  const content = String(formData.get("content") ?? "");

  await createOffering({
    name,
    content,
    sourceUrl: null,
  });
}
