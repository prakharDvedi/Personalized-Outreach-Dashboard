export { createProspect, addInput, updateContext } from "./prospects/mutations";
export { listProspects, getProspectById } from "./prospects/queries";
export { addInputWithExtraction } from "./prospects/extraction";
export type {
  CreateProspectInput,
  AddProspectInputPayload,
  AddInputWithExtractionPayload,
  UpdateProspectContextPayload,
} from "./prospects/types";
