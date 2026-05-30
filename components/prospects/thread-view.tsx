//  this component displays the conversation thread for a specific message, showing the original message, any replies from the prospect, and the AI-generated follow-ups in a threaded format.

"use client";

import type { ConversationTurn } from "./types";

type Props = {
  messageId: string;
  turns: ConversationTurn[];
};

export function ThreadView({ messageId, turns }: Props) {
  if (turns.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
        Thread
      </p>
      {turns.map((turn, index) => (
        <div
          key={`${messageId}-${index}-${turn.timestamp}`}
          className="rounded-md border border-white-100 p-2"
        >
          <p className="text-[11px] font-semibold uppercase text-white-500">
            {turn.role === "assistant" ? "You" : "Prospect"}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-white-800">
            {turn.content}
          </p>
        </div>
      ))}
    </div>
  );
}