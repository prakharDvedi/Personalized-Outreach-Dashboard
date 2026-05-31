import { ActionButton } from "@/components/ui/action-button";

type Props = {
  initialPrompt: string;
  saveAction: (formData: FormData) => Promise<void>;
  resetAction: () => Promise<void>;
};

export function PromptEditor({ initialPrompt, saveAction, resetAction }: Props) {
  return (
    <section className="mt-6 rounded-xl border border-white-200 p-4">
      <form action={saveAction} className="grid gap-3">
        <textarea
          name="content"
          required
          rows={18}
          defaultValue={initialPrompt}
          className="w-full rounded-md border border-white-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
        />
        <div className="flex gap-2">
          <ActionButton type="submit" pendingLabel="Saving prompt...">
            Save prompt
          </ActionButton>
          <ActionButton
            formAction={resetAction}
            type="submit"
            variant="secondary"
            pendingLabel="Resetting..."
          >
            Reset to default
          </ActionButton>
        </div>
      </form>
    </section>
  );
}
