"use client";

import { useActionState, useEffect, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import {
  importOfferingFromUrl,
  type ImportOfferingFromUrlState,
} from "@/actions/offerings/mutations";

type Props = {
  action: (formData: FormData) => Promise<void>;
};

const initialImportState: ImportOfferingFromUrlState = {
  error: null,
  sourceUrl: "",
  content: "",
  success: false,
  nonce: 0,
};

export function CreateOfferingForm({ action }: Props) {
  const [importState, importAction, importPending] = useActionState(
    importOfferingFromUrl,
    initialImportState,
  );
  const [name, setName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!importState.success) {
      return;
    }

    setSourceUrl(importState.sourceUrl);
    setContent(importState.content);
  }, [importState.content, importState.sourceUrl, importState.success, importState.nonce]);

  return (
    <section className="mb-8 rounded-xl border border-white-200 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-white/80">
        Create offering
      </h2>
      <div className="mt-4 grid gap-4">
        <form action={importAction} className="grid gap-3 rounded-lg border border-white-200 p-3">
          <label className="text-sm font-medium">Import from URL</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              name="sourceUrl"
              type="url"
              required
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://your-site.com/offering-page"
              className="w-full rounded-md border border-white-300 bg-white px-3 py-2 text-sm text-black outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
            />
            <ActionButton
              type="submit"
              variant="secondary"
              busy={importPending}
              pendingLabel="Importing..."
            >
              Import
            </ActionButton>
          </div>
          {importState.error ? (
            <p className="text-sm text-red-600">{importState.error}</p>
          ) : null}
          {importState.success ? (
            <p className="text-sm text-emerald-600">
              Imported content from the URL. Review and edit below.
            </p>
          ) : null}
        </form>

        <form action={action} className="grid gap-3">
          <input
            name="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Offering name"
            className="rounded-md border border-white-300 bg-white px-3 py-2 text-sm text-black outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
          />
          <input type="hidden" name="sourceUrl" value={sourceUrl} />
          <textarea
            name="content"
            required
            rows={5}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What do you offer? Keep it practical and clear."
            className="rounded-md border border-white-300 bg-white px-3 py-2 text-sm text-black outline-none ring-offset-2 focus:border-white-500 focus:ring-2"
          />
          <ActionButton type="submit" pendingLabel="Creating...">
            Create
          </ActionButton>
        </form>
      </div>
    </section>
  );
}
