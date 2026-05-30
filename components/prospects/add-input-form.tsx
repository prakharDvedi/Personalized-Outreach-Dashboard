"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { addInputWithExtraction } from "@/actions/prospects";
import type { ProspectInput } from "@/db/schema";

type Props = {
  prospectId: string;
};

export function AddInputForm({ prospectId }: Props) {
  const router = useRouter();
  const [type, setType] = useState<ProspectInput["type"]>("url");
  const [rawValue, setRawValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isScreenshot = type === "linkedin_screenshot";

  const readFileAsBase64 = async (imageFile: File): Promise<string> => {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(imageFile);
    });

    const base64 = dataUrl.split(",")[1] ?? "";
    if (!base64) {
      throw new Error("Invalid image file");
    }

    return base64;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (isScreenshot) {
        if (!file) {
          throw new Error("Upload a LinkedIn screenshot first");
        }

        const base64 = await readFileAsBase64(file);

        await addInputWithExtraction({
          prospectId,
          type,
          rawValue: file.name,
          screenshotBase64: base64,
        });
      } else {
        const trimmed = rawValue.trim();
        if (!trimmed) {
          throw new Error("Input value is required");
        }

        await addInputWithExtraction({
          prospectId,
          type,
          rawValue: trimmed,
        });
      }

      setRawValue("");
      setFile(null);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add input");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid gap-2">
      <select
        value={type}
        onChange={(event) => setType(event.target.value as ProspectInput["type"])}
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
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="rounded-md border border-white-300 px-3 py-2 text-sm"
        />
      ) : (
        <textarea
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
