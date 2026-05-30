// this is the main prospects page where users can see a list of their prospects, search them by name, and add new prospects. 
// app/(app)/prospects/page.tsx
import { createProspect, listProspects } from "@/actions/prospects";
import { ProspectCreateForm } from "@/components/prospects/prospect-create-form";
import { ProspectList } from "@/components/prospects/prospect-list";
import { ProspectSearchForm } from "@/components/prospects/prospect-search-form";

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

      <ProspectSearchForm defaultValue={q ?? ""} />
      <ProspectCreateForm action={createProspectAction} />
      <ProspectList prospects={prospects} />
    </main>
  );
}

async function createProspectAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "");
  await createProspect({ name });
}
