// this is the main prospects page where users can see a list of their prospects, search them by name, and add new prospects. 
// app/(app)/prospects/page.tsx
import Link from "next/link";
import { createProspect, listProspects } from "@/actions/prospects";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ProspectsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const prospects = await listProspects(q);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Prospects</h1>
        <p className="mt-1 text-sm text-white/80">
          Save leads and enrich context before generating outreach.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-white-200 p-4">
        <form action="/prospects" className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search prospects by name"
            className="w-full rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-md border border-white-300 px-3 py-2 text-sm hover:bg-white-50"
          >
            Search
          </button>
        </form>
      </section>

      <section className="mb-8 rounded-xl border border-white-200 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
          Add prospect
        </h2>
        <form action={createProspectAction} className="mt-3 flex gap-2">
          <input
            name="name"
            required
            placeholder="Prospect name"
            className="w-full rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-white-800"
          >
            Create
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {prospects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white-300 p-6 text-sm text-white/80">
            No prospects yet.
          </div>
        ) : (
          prospects.map((prospect) => (
            <article
              key={prospect.id}
              className="rounded-xl border border-white-200 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{prospect.name}</h3>
                  <p className="mt-1 text-xs text-white-500">
                    Inputs: {prospect.inputs.length}
                  </p>
                </div>
                <Link
                  href={`/prospects/${prospect.id}`}
                  className="rounded-md border border-white-300 px-3 py-1.5 text-xs font-medium hover:bg-white-50"
                >
                  Open
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

async function createProspectAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "");
  await createProspect({ name });
}