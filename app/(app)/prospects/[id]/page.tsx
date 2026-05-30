// This is the prospect detail page where users can see all the inputs they've added for a prospect, the compiled context extracted from those inputs, and generate outreach messages based on that context and a selected offering.

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { offerings, prospects } from "@/db/schema";
import { addInput, getProspectById } from "@/actions/prospects";
import { listMessagesByProspect, saveMessage } from "@/actions/messages";
import { buildSystemPrompt, DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import { extractFromScreenshot, extractFromUrl } from "@/lib/scraper";
import { GeneratorPanel } from "@/components/prospects/generator-panel";

type PageProps = {
  params: Promise<{ id: string }>;
};

type InputType =
  | "linkedin_screenshot"
  | "github_url"
  | "personal_website"
  | "company_website"
  | "url"
  | "free_text";

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
            <form action={addInputAction} className="mt-3 grid gap-2">
              <input type="hidden" name="prospectId" value={prospect.id} />
              <select
                name="type"
                required
                className="rounded-md border border-white-300 px-3 py-2 text-sm"
                defaultValue="url"
              >
                <option value="linkedin_screenshot">
                  LinkedIn screenshot (base64)
                </option>
                <option value="github_url">GitHub URL</option>
                <option value="personal_website">Personal website</option>
                <option value="company_website">Company website</option>
                <option value="url">Any URL</option>
                <option value="free_text">Free text</option>
              </select>
              <textarea
                name="rawValue"
                required
                rows={5}
                placeholder="URL, free text, or base64 image string for screenshot input"
                className="rounded-md border border-white-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-white-800"
              >
                Add input
              </button>
            </form>
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

async function addInputAction(formData: FormData) {
  "use server";

  const prospectId = String(formData.get("prospectId") ?? "");
  const type = String(formData.get("type") ?? "") as InputType;
  const rawValue = String(formData.get("rawValue") ?? "").trim();

  if (!prospectId || !type || !rawValue) {
    return;
  }

  let extractedText = "";

  if (type === "free_text") {
    extractedText = rawValue;
  } else if (type === "linkedin_screenshot") {
    extractedText = await extractFromScreenshot(rawValue);
  } else {
    extractedText = await extractFromUrl(rawValue);
  }

  await addInput({
    prospectId,
    input: {
      type,
      rawValue,
      extractedText,
    },
  });
}

async function generateAndSaveAction(formData: FormData) {
  "use server";

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    return;
  }

  const prospectId = String(formData.get("prospectId") ?? "");
  const offeringId = String(formData.get("offeringId") ?? "");

  if (!prospectId || !offeringId) {
    return;
  }

  const prospect = await db.query.prospects.findFirst({
    where: and(eq(prospects.id, prospectId), eq(prospects.userId, userId)),
  });

  const offering = await db.query.offerings.findFirst({
    where: and(eq(offerings.id, offeringId), eq(offerings.userId, userId)),
  });

  if (!prospect || !offering) {
    return;
  }

  const userPrompt = await db.query.userPrompts.findFirst({
    where: (table, { eq: equals }) => equals(table.userId, userId),
  });

  const system = buildSystemPrompt(
    userPrompt?.content ?? DEFAULT_SYSTEM_PROMPT,
    offering.content,
  );

  const response = await fetch(
    `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        system,
        messages: [
          {
            role: "user",
            content: prospect.extractedContext || "No context provided yet.",
          },
        ],
      }),
    },
  );

  if (!response.ok || !response.body) {
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let finalMessage = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    finalMessage += decoder.decode(value, { stream: true });
  }

  if (!finalMessage.trim()) {
    return;
  }

  await saveMessage({
    prospectId,
    offeringId,
    content: finalMessage.trim(),
  });
}
