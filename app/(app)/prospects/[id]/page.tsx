// This is the prospect detail page where users can see all the inputs they've added for a prospect, the compiled context extracted from those inputs, and generate outreach messages based on that context and a selected offering.

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { offerings } from "@/db/schema";
import { getProspectById } from "@/actions/prospects";
import { listMessagesByProspect } from "@/actions/messages";
import { GeneratorPanel } from "@/components/prospects/generator-panel";
import { AddInputForm } from "@/components/prospects/add-input-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProspectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    notFound();
  }

  const prospect = await getProspectById(id);

  const userPrompt = await db.query.userPrompts.findFirst({
    where: (table, { eq: equals }) => equals(table.userId, userId),
  });

  const offeringList = await db.query.offerings.findMany({
    where: eq(offerings.userId, userId),
  });

  const messageHistory = await listMessagesByProspect(id);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="space-y-4 rounded-xl border border-white-200 p-4">
          <div>
            <h1 className="text-2xl font-semibold">{prospect.name}</h1>
            <p className="mt-1 text-sm text-white/80">
              Add inputs to build prospect context.
            </p>
          </div>

          <div className="rounded-lg border border-white-200 p-3">
            <h2 className="text-sm font-semibold">Current inputs</h2>
            {prospect.inputs.length === 0 ? (
              <p className="mt-2 text-sm text-white-500">No inputs yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {prospect.inputs.map((input, idx) => (
                  <li
                    key={`${input.type}-${idx}`}
                    className="rounded-md border border-white-100 p-2 text-sm"
                  >
                    <p className="font-medium">
                      {input.type.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-xs text-white/80">
                      {input.rawValue}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-white-200 p-3">
            <h2 className="text-sm font-semibold">Add input</h2>
            <AddInputForm prospectId={prospect.id} />
          </div>

          <div className="rounded-lg border border-white-200 p-3">
            <h2 className="text-sm font-semibold">Compiled context</h2>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap text-xs text-white/80">
              {prospect.extractedContext || "No context yet."}
            </pre>
          </div>
        </section>

        <GeneratorPanel
          prospectId={prospect.id}
          extractedContext={prospect.extractedContext}
          offerings={offeringList.map((o) => ({
            id: o.id,
            name: o.name,
            content: o.content,
          }))}
          userPrompt={userPrompt?.content ?? null}
          initialMessages={messageHistory.map((m) => ({
            id: m.id,
            content: m.content,
            rating: m.rating,
            isFavourite: m.isFavourite,
          }))}
        />
      </div>
    </main>
  );
}
