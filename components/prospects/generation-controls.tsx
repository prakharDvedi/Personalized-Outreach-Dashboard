// this component contains the controls for generating AI messages, including the offering selection dropdown and the generate button. 
"use client";

import type { OfferingOption } from "./types";
import { ActionButton } from "@/components/ui/action-button";
import { SelectField } from "@/components/ui/select-field";

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
      <SelectField
        value={selectedOfferingId}
        onChange={(event) => onOfferingChangeAction(event.target.value)}
      >
        <option value="">Select offering</option>
        {offerings.map((offering) => (
          <option key={offering.id} value={offering.id}>
            {offering.name}
          </option>
        ))}
      </SelectField>

      <ActionButton
        type="button"
        busy={isGenerating}
        pendingLabel="Generating..."
        onClick={onGenerateAction}
      >
        Generate message
      </ActionButton>
    </div>
  );
}
