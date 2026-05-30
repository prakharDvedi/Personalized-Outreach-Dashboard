import type { ProspectInput } from "@/db/schema";

export type CreateProspectInput = {
  name: string;
};

export type AddProspectInputPayload = {
  prospectId: string;
  input: ProspectInput;
};

export type AddInputWithExtractionPayload = {
  prospectId: string;
  type: ProspectInput["type"];
  rawValue: string;
  screenshotBase64?: string;
};

export type UpdateProspectContextPayload = {
  prospectId: string;
  extractedContext: string;
};
