// this is the main generator panel component that is used in the prospect detail page. 
//It allows users to select an offering, generate an outreach message using the AI, 
// and view the message history with the ability to reply and generate follow-ups. 
// It uses the useMessageGeneration and useReplyThread hooks to manage the state and logic for these features.
// components/prospects/generator-panel.tsx
"use client";

import { GenerationControls } from "./generation-controls";
import { LiveOutput } from "./live-output";
import { MessageHistory } from "./message-history";
import { useMessageGeneration } from "./use-message-generation";
import { useReplyThread } from "./use-reply-thread";
import type { GeneratorPanelProps } from "./types";

export function GeneratorPanel({
  prospectId,
  extractedContext,
  offerings,
  userPrompt,
  initialMessages,
}: GeneratorPanelProps) {
  const generation = useMessageGeneration({
    prospectId,
    extractedContext,
    offerings,
    userPrompt,
    initialMessages,
  });

  const replies = useReplyThread({
    selectedOffering: generation.selectedOffering,
    userPrompt,
  });

  return (
    <section className="space-y-4 rounded-xl border border-gray-200 p-4">
      <div>
        <h2 className="text-xl font-semibold">Generate outreach</h2>
        <p className="mt-1 text-sm text-gray-600">
          Select offering, generate, and save output.
        </p>
      </div>

      <GenerationControls
        offerings={offerings}
        selectedOfferingId={generation.selectedOfferingId}
        isGenerating={generation.isGenerating}
        onOfferingChangeAction={generation.setSelectedOfferingId}
        onGenerateAction={generation.generate}
      />

      {generation.error ? (
        <p className="text-sm text-red-600">{generation.error}</p>
      ) : null}

      {replies.replyError ? (
        <p className="text-sm text-red-600">{replies.replyError}</p>
      ) : null}

      <LiveOutput text={generation.streamedText} />

      <MessageHistory
        messages={generation.messages}
        openReplyFor={replies.openReplyFor}
        replyDraft={replies.replyDraft}
        replyLoadingFor={replies.replyLoadingFor}
        threadByMessage={replies.threadByMessage}
        onOpenReplyAction={replies.openReplyComposer}
        onReplyDraftChangeAction={replies.setReplyDraft}
        onGenerateFollowUpAction={replies.generateFollowUp}
      />
    </section>
  );
}