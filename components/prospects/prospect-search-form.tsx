type Props = {
  defaultValue?: string;
};

export function ProspectSearchForm({ defaultValue }: Props) {
  return (
    <section className="mb-6 rounded-xl border border-white-200 p-4">
      <form action="/prospects" className="flex gap-2">
        <input
          name="q"
          defaultValue={defaultValue ?? ""}
          placeholder="Search prospects by name"
          className="w-full rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
        />
        <button
          type="submit"
          className="rounded-md border border-white-300 px-3 py-2 text-sm hover:bg-white-50"
        >
          Search
        </button>
      </form>
    </section>
  );
}
