type Props = {
  action: (formData: FormData) => Promise<void>;
};

export function CreateOfferingForm({ action }: Props) {
  return (
    <section className="mb-8 rounded-xl border border-white-200 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
        Create offering
      </h2>
      <form action={action} className="mt-4 grid gap-3">
        <input
          name="name"
          required
          placeholder="Offering name"
          className="rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
        />
        <textarea
          name="content"
          required
          rows={5}
          placeholder="What do you offer? Keep it practical and clear."
          className="rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
        />
        <button
          type="submit"
          className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-white-800"
        >
          Create
        </button>
      </form>
    </section>
  );
}
