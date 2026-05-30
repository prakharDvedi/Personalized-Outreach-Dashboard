// This is the system prompt management page where users can customize the AI's behavior by editing the system prompt. The prompt is stored in the database and can be reset to a default value. 
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { userPrompts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";

export default async function PromptPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existing = await db.query.userPrompts.findFirst({
    where: eq(userPrompts.userId, userId),
  });

  const promptContent = existing?.content ?? DEFAULT_SYSTEM_PROMPT;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold">System prompt</h1>
      <p className="mt-2 text-sm text-gray-600">
        The prompt is the brief you give the AI before it generates a message.
        It controls tone, length, and angle. Think of it as briefing a copywriter.
      </p>

      <section className="mt-6 rounded-xl border border-gray-200 p-4">
        <form action={savePromptAction} className="grid gap-3">
          <textarea
            name="content"
            required
            rows={18}
            defaultValue={promptContent}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-gray-500 focus:ring-2"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Save prompt
            </button>
            <button
              formAction={resetPromptAction}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Reset to default
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

async function savePromptAction(formData: FormData) {
  "use server";

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const content = String(formData.get("content") ?? "").trim();

  const existing = await db.query.userPrompts.findFirst({
    where: eq(userPrompts.userId, userId),
  });

  if (!existing) {
    await db.insert(userPrompts).values({
      userId,
      content,
    });
    return;
  }

  await db
    .update(userPrompts)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(and(eq(userPrompts.id, existing.id), eq(userPrompts.userId, userId)));
}

async function resetPromptAction() {
  "use server";

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const existing = await db.query.userPrompts.findFirst({
    where: eq(userPrompts.userId, userId),
  });

  if (!existing) {
    await db.insert(userPrompts).values({
      userId,
      content: DEFAULT_SYSTEM_PROMPT,
    });
    return;
  }

  await db
    .update(userPrompts)
    .set({
      content: DEFAULT_SYSTEM_PROMPT,
      updatedAt: new Date(),
    })
    .where(and(eq(userPrompts.id, existing.id), eq(userPrompts.userId, userId)));
}