// This is the system prompt management page where users can customize the AI's behavior by editing the system prompt. The prompt is stored in the database and can be reset to a default value. 
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { userPrompts } from "@/db/schema";
import { getSessionUserId } from "@/lib/session";
import { DEFAULT_SYSTEM_PROMPT } from "@/lib/prompts";
import { PromptEditor } from "@/components/prompt/prompt-editor";
export const dynamic = 'force-dynamic'

export default async function PromptPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

  const existing = await db.query.userPrompts.findFirst({
    where: eq(userPrompts.userId, userId),
  });

  const promptContent = existing?.content ?? DEFAULT_SYSTEM_PROMPT;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-semibold">System prompt</h1>
      <p className="mt-2 text-sm text-white/80">
        The prompt is the brief you give the AI before it generates a message.
        It controls tone, length, and angle. Think of it as briefing a copywriter.
      </p>

      <PromptEditor
        initialPrompt={promptContent}
        saveAction={savePromptAction}
        resetAction={resetPromptAction}
      />
    </main>
  );
}

async function savePromptAction(formData: FormData) {
  "use server";

  const { auth } = await import("@/lib/auth");
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
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

  revalidatePath("/prompt");
}

async function resetPromptAction() {
  "use server";

  const { auth } = await import("@/lib/auth");
  const { headers } = await import("next/headers");
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
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

  revalidatePath("/prompt");
}
