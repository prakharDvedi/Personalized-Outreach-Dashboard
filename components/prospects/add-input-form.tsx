"use client";

import { useState } from "react";
import { addInputFromFormData } from "@/actions/prospects";
import type { ProspectInput } from "@/db/schema";

type Props = {
  prospectId: string;
};

export function AddInputForm({ prospectId }: Props) {
  const [type, setType] = useState<ProspectInput["type"]>("url");
  const [rawValue, setRawValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isScreenshot = type === "linkedin_screenshot";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);

      if (isScreenshot) {
        if (!file) {
          throw new Error("Upload a LinkedIn screenshot first");
        }

        formData.set("rawValue", file.name);
        formData.set("screenshotName", file.name);
      }

      await addInputFromFormData(formData);

      setRawValue("");
      setFile(null);
      setType("url");
      event.currentTarget.reset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add input");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-2" encType="multipart/form-data">
      <input type="hidden" name="prospectId" value={prospectId} />
      <select
        value={type}
        onChange={(event) => setType(event.target.value as ProspectInput["type"])}
        name="type"
        className="rounded-md border border-white-300 px-3 py-2 text-sm"
      >
        <option value="linkedin_screenshot">LinkedIn screenshot</option>
        <option value="github_url">GitHub URL</option>
        <option value="personal_website">Personal website</option>
        <option value="company_website">Company website</option>
        <option value="url">Any URL</option>
        <option value="free_text">Free text</option>
      </select>

      {isScreenshot ? (
        <input
          type="file"
          name="screenshot"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="rounded-md border border-white-300 px-3 py-2 text-sm"
        />
      ) : (
        <textarea
          name="rawValue"
          value={rawValue}
          onChange={(event) => setRawValue(event.target.value)}
          rows={5}
          placeholder="URL or free text"
          className="rounded-md border border-white-300 px-3 py-2 text-sm"
        />
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-white-800 disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add input"}
      </button>
    </form>
  );
}
