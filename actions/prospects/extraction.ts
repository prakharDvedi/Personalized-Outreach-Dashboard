"use server";

import { extractFromScreenshot, extractFromUrl } from "@/lib/scraper";
import { logger } from "@/lib/logger";
import { addInput } from "./mutations";
import type { AddInputWithExtractionPayload } from "./types";

export async function addInputWithExtraction(
  payload: AddInputWithExtractionPayload,
) {
  const rawValue = payload.rawValue.trim();
  if (!payload.prospectId || !payload.type || !rawValue) {
    throw new Error("Invalid input payload");
  }

  logger.info("actions/prospects", "add input with extraction start", {
    prospectId: payload.prospectId,
    type: payload.type,
  });

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

export async function addInputFromFormData(formData: FormData) {
  const prospectId = String(formData.get("prospectId") ?? "");
  const type = String(formData.get("type") ?? "") as AddInputWithExtractionPayload["type"];
  const rawValue = String(formData.get("rawValue") ?? "").trim();

  if (!prospectId || !type || (type !== "linkedin_screenshot" && !rawValue)) {
    throw new Error("Invalid input payload");
  }

  logger.info("actions/prospects", "add input from form start", {
    prospectId,
    type,
  });

  let extractedText = "";

  if (type === "free_text") {
    extractedText = rawValue;
  } else if (type === "linkedin_screenshot") {
    const screenshot = formData.get("screenshot");
    if (!(screenshot instanceof File) || screenshot.size === 0) {
      throw new Error("Upload a LinkedIn screenshot first");
    }

    const bytes = await screenshot.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    extractedText = await extractFromScreenshot(base64);
  } else {
    extractedText = await extractFromUrl(rawValue);
  }

  return addInput({
    prospectId,
    input: {
      type,
      rawValue: type === "linkedin_screenshot" ? String(formData.get("screenshotName") ?? "screenshot") : rawValue,
      extractedText,
    },
  });
}
