"use server";

import { extractFromScreenshot, extractFromUrl } from "@/lib/scraper";
import { logger } from "@/lib/logger";
import { addInput } from "./mutations";
import type { AddInputWithExtractionPayload } from "./types";

export type AddInputFormState = {
  error: string | null;
  success: boolean;
  nonce: number;
};

const initialState: AddInputFormState = {
  error: null,
  success: false,
  nonce: 0,
};

function failure(message: string): AddInputFormState {
  return { ...initialState, error: message };
}

function success(): AddInputFormState {
  return { error: null, success: true, nonce: Date.now() };
}

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

export async function addInputFromFormData(
  _prevState: AddInputFormState,
  formData: FormData,
): Promise<AddInputFormState> {
  try {
    const prospectId = String(formData.get("prospectId") ?? "");
    const type = String(formData.get("type") ?? "") as AddInputWithExtractionPayload["type"];
    const rawValue = String(formData.get("rawValue") ?? "").trim();

    if (!prospectId || !type || (type !== "linkedin_screenshot" && !rawValue)) {
      return failure("Invalid input payload");
    }

    logger.info("actions/prospects", "add input from form start", {
      prospectId,
      type,
    });

    let extractedText = "";
    let screenshotName = "screenshot";

    if (type === "free_text") {
      extractedText = rawValue;
    } else if (type === "linkedin_screenshot") {
      const screenshot = formData.get("screenshot");
      if (!(screenshot instanceof File) || screenshot.size === 0) {
        return failure("Upload a LinkedIn screenshot first");
      }

      screenshotName = screenshot.name || screenshotName;
      const bytes = await screenshot.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = screenshot.type || "image/png";

      logger.info("actions/prospects", "screenshot received", {
        prospectId,
        fileName: screenshot.name,
        mimeType,
        size: screenshot.size,
      });

      extractedText = await extractFromScreenshot(base64, mimeType);
    } else {
      extractedText = await extractFromUrl(rawValue);
    }

    await addInput({
      prospectId,
      input: {
        type,
        rawValue:
          type === "linkedin_screenshot" ? screenshotName : rawValue,
        extractedText,
      },
    });

    return success();
  } catch (error) {
    logger.error(
      "actions/prospects",
      error instanceof Error ? error.message : "unknown add input failure",
    );
    return failure(
      error instanceof Error ? error.message : "Failed to add input",
    );
  }
}
