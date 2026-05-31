// this is the main page for managing offerings.
import { redirect } from "next/navigation";
import { createOffering, listOfferings } from "@/actions/offerings";
import { getSessionUserId } from "@/lib/session";
import { CreateOfferingForm } from "@/components/offerings/create-offering-form";
import { OfferingList } from "@/components/offerings/offering-list";

export const dynamic = 'force-dynamic'

export default async function OfferingsPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/login");
  }

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

      <CreateOfferingForm action={createOfferingAction} />
      <OfferingList offerings={offeringList} />
    </main>
  );
}

async function createOfferingAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") ?? "");
  const content = String(formData.get("content") ?? "");
  const sourceUrlRaw = String(formData.get("sourceUrl") ?? "").trim();

  await createOffering({
    name,
    content,
    sourceUrl: sourceUrlRaw || null,
  });
}
