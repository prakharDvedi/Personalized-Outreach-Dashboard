import { ActionButton } from "@/components/ui/action-button";

type Props = {
  action: (formData: FormData) => Promise<void>;
};

export function ProspectCreateForm({ action }: Props) {
  return (
    <section className="mb-8 rounded-xl border border-white-200 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
        Add prospect
      </h2>
      <form action={action} className="mt-3 flex gap-2">
        <input
          name="name"
          required
          placeholder="Prospect name"
          className="w-full rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
        />
        <ActionButton type="submit" pendingLabel="Creating...">
          Create
        </ActionButton>
      </form>
    </section>
  );
}
