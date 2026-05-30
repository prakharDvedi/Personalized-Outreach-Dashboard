// this component is responsible for rendering the reply composer UI 
// when a user wants to generate a follow-up message based on a prospect's reply.

"use client";

import { ThreadView } from "./thread-view";
import type { ConversationTurn } from "./types";

type Props = {
  isOpen: boolean;
  draft: string;
  isLoading: boolean;
  messageId: string;
  thread: ConversationTurn[];
  onDraftChangeAction: (value: string) => void;
  onGenerateFollowUpAction: (messageId: string, originalMessage: string) => void;
  originalMessage: string;
};

export function ReplyComposer({
  isOpen,
  draft,
  isLoading,
  messageId,
  thread,
  onDraftChangeAction,
  onGenerateFollowUpAction,
  originalMessage,
}: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 rounded-md border border-white-200 p-3">
      <label className="text-xs font-semibold uppercase tracking-wide text-white/80">
        Prospect reply
      </label>
      <textarea
        rows={4}
        value={draft}
        onChange={(event) => onDraftChangeAction(event.target.value)}
        placeholder="Paste the prospect's reply..."
        className="w-full rounded-md border border-white-300 px-3 py-2 text-sm"
      />
      <button
        type="button"
        disabled={isLoading}
        onClick={() => onGenerateFollowUpAction(messageId, originalMessage)}
        className="rounded-md bg-black px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
      >
        {isLoading ? "Generating follow-up..." : "Generate follow-up"}
      </button>

      <ThreadView messageId={messageId} turns={thread} />
    </div>
  );
}