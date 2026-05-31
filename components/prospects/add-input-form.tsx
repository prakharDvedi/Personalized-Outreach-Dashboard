"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addInputFromFormData, type AddInputFormState } from "@/actions/prospects";
import type { ProspectInput } from "@/db/schema";

type Props = {
  prospectId: string;
};

const initialState: AddInputFormState = {
  error: null,
  success: false,
  nonce: 0,
};

async function compressScreenshot(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not prepare the screenshot");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (value) {
          resolve(value);
          return;
        }
        reject(new Error("Could not compress the screenshot"));
      },
      "image/jpeg",
      0.82,
    );
  });

  const nextName = file.name.replace(/\.[^.]+$/, "") || "screenshot";
  return new File([blob], `${nextName}.jpg`, { type: "image/jpeg" });
}

export function AddInputForm({ prospectId }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    addInputFromFormData,
    initialState,
  );
  const [type, setType] = useState<ProspectInput["type"]>("url");
  const [rawValue, setRawValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [localError, setLocalError] = useState("");

  const isScreenshot = type === "linkedin_screenshot";
  const busy = pending || isPreparing;
  const error = localError || state.error || "";

  useEffect(() => {
    if (!state.success) {
      return;
    }

    setType("url");
    setRawValue("");
    setFile(null);
    setLocalError("");
    formRef.current?.reset();
    router.refresh();
  }, [router, state.nonce, state.success]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextFile = event.target.files?.[0] ?? null;
    setLocalError("");

    if (!nextFile) {
      setFile(null);
      return;
    }

    try {
      setIsPreparing(true);
      const optimized = await compressScreenshot(nextFile);
      setFile(optimized);
    } catch (err: unknown) {
      setFile(null);
      setLocalError(
        err instanceof Error ? err.message : "Failed to process screenshot",
      );
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      encType="multipart/form-data"
      className="mt-3 grid gap-2"
    >
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
        <div className="grid gap-2">
          <input
            type="file"
            name="screenshot"
            accept="image/*"
            onChange={handleFileChange}
            className="rounded-md border border-white-300 px-3 py-2 text-sm"
          />
          {file ? (
            <p className="text-xs text-white/70">
              Ready: {file.name} ({Math.round(file.size / 1024)} KB)
            </p>
          ) : null}
        </div>
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
        disabled={busy || (isScreenshot && !file)}
        className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-white-800 disabled:opacity-50"
      >
        {busy ? "Adding..." : "Add input"}
      </button>
    </form>
  );
}
