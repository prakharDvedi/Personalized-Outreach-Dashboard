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
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-white-800"
          >
            Save prompt
          </button>
          <button
            formAction={resetAction}
            className="rounded-md border border-white-300 px-4 py-2 text-sm hover:bg-white-50"
          >
            Reset to default
          </button>
        </div>
      </form>
    </section>
  );
}
