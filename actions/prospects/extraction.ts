"use server";

import { extractFromScreenshot, extractFromUrl } from "@/lib/scraper";
import { addInput } from "./mutations";
import type { AddInputWithExtractionPayload } from "./types";

export async function addInputWithExtraction(
  payload: AddInputWithExtractionPayload,
) {
  const rawValue = payload.rawValue.trim();
  if (!payload.prospectId || !payload.type || !rawValue) {
    throw new Error("Invalid input payload");
  }

  let extractedText = "";

  if (payload.type === "free_text") {
    extractedText = rawValue;
  } else if (payload.type === "linkedin_screenshot") {
    if (!payload.screenshotBase64) {
      throw new Error("Screenshot data is required");
    }
    extractedText = await extractFromScreenshot(payload.screenshotBase64);
  } else {
    extractedText = await extractFromUrl(rawValue);
  }

  return addInput({
    prospectId: payload.prospectId,
    input: {
      type: payload.type,
      rawValue,
      extractedText,
    },
  });
}
