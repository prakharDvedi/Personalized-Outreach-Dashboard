type Props = {
  action: (formData: FormData) => Promise<void>;
  offeringId: string;
  defaultValue?: string | null;
};

export function OfferingImportForm({ action, offeringId, defaultValue }: Props) {
  return (
    <section className="mt-6 rounded-xl border border-white-200 p-4">
      <form action={action} className="flex gap-2">
        <input type="hidden" name="id" value={offeringId} />
        <input
          name="url"
          type="url"
          required
          defaultValue={defaultValue ?? ""}
          placeholder="https://your-site.com/offering-page"
          className="w-full rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-md border border-white-300 px-3 py-2 text-sm hover:bg-white-50"
        >
          Import from URL
        </button>
      </form>
    </section>
  );
}
