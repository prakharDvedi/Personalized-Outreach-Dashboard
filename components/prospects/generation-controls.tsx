// this component contains the controls for generating AI messages, including the offering selection dropdown and the generate button. 
"use client";

import type { OfferingOption } from "./types";

type Props = {
  offerings: OfferingOption[];
  selectedOfferingId: string;
  isGenerating: boolean;
  onOfferingChangeAction: (offeringId: string) => void;
  onGenerateAction: () => void;
};

export function GenerationControls({
  offerings,
  selectedOfferingId,
  isGenerating,
  onOfferingChangeAction,
  onGenerateAction,
}: Props) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">Offering</label>
      <select
        value={selectedOfferingId}
        onChange={(event) => onOfferingChangeAction(event.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">Select offering</option>
        {offerings.map((offering) => (
          <option key={offering.id} value={offering.id}>
            {offering.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={isGenerating}
        onClick={onGenerateAction}
        className="w-fit rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isGenerating ? "Generating..." : "Generate message"}
      </button>
    </div>
  );
}