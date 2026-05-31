// This is the prospect detail page where users can see all the inputs they've added for a prospect, the compiled context extracted from those inputs, and generate outreach messages based on that context and a selected offering.

import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { offerings } from "@/db/schema";
import { getSessionUserId } from "@/lib/session";
import { getProspectById } from "@/actions/prospects";
import { listMessagesByProspect } from "@/actions/messages";
import { GeneratorPanel } from "@/components/prospects/generator-panel";
import { AddInputForm } from "@/components/prospects/add-input-form";
import { ProspectInputsPanel } from "@/components/prospects/prospect-inputs-panel";
import { ProspectContextPanel } from "@/components/prospects/prospect-context-panel";

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = 'force-dynamic'

export default async function ProspectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
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

          <ProspectInputsPanel inputs={prospect.inputs} />

          <div className="rounded-lg border border-white-200 p-3">
            <h2 className="text-sm font-semibold">Add input</h2>
            <AddInputForm prospectId={prospect.id} />
          </div>

          <ProspectContextPanel context={prospect.extractedContext} />
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
