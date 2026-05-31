import { ActionButton } from "@/components/ui/action-button";

type Props = {
  action: (formData: FormData) => Promise<void>;
  offeringId: string;
  name: string;
  sourceUrl?: string | null;
  content: string;
};

export function OfferingEditForm({
  action,
  offeringId,
  name,
  sourceUrl,
  content,
}: Props) {
  return (
    <section className="mt-4 rounded-xl border border-white-200 p-4">
      <form action={action} className="grid gap-3">
        <input type="hidden" name="id" value={offeringId} />
        <input
          name="name"
          required
          defaultValue={name}
          placeholder="Offering name"
          className="rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
        />
        <input
          name="sourceUrl"
          defaultValue={sourceUrl ?? ""}
          placeholder="Source URL (optional)"
          className="rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
        />
        <textarea
          name="content"
          required
          rows={14}
          defaultValue={content}
          placeholder="Main offering content"
          className="rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
        />
        <ActionButton type="submit" pendingLabel="Saving...">
          Save
        </ActionButton>
      </form>
    </section>
  );
}
