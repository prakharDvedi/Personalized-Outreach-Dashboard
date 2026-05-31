export { createProspect, addInput, updateContext } from "./prospects/mutations";
export { listProspects, getProspectById } from "./prospects/queries";
export { addInputWithExtraction, addInputFromFormData } from "./prospects/extraction";
export type {
  CreateProspectInput,
  AddProspectInputPayload,
  AddInputWithExtractionPayload,
  UpdateProspectContextPayload,
} from "./prospects/types";
