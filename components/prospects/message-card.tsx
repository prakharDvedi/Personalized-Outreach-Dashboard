// this component represents an individual message card in the message history.

"use client";

import { ReplyComposer } from "./reply-composer";
import type { ConversationTurn, MessageItem } from "./types";

type Props = {
  message: MessageItem;
  isReplyOpen: boolean;
  replyDraft: string;
  isReplyLoading: boolean;
  thread: ConversationTurn[];
  onOpenReplyAction: (messageId: string, originalMessage: string) => void;
  onReplyDraftChangeAction: (value: string) => void;
  onGenerateFollowUpAction: (messageId: string, originalMessage: string) => void;
};

export function MessageCard({
  message,
  isReplyOpen,
  replyDraft,
  isReplyLoading,
  thread,
  onOpenReplyAction,
  onReplyDraftChangeAction,
  onGenerateFollowUpAction,
}: Props) {
  return (
    <article className="rounded-md border border-gray-100 p-3">
      <p className="whitespace-pre-wrap text-sm text-gray-800">{message.content}</p>
      <p className="mt-2 text-xs text-gray-500">
        Rating: {message.rating ?? "-"} | Favourite: {message.isFavourite ? "Yes" : "No"}
      </p>

      <div className="mt-3">
        <button
          type="button"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
          onClick={() => onOpenReplyAction(message.id, message.content)}
        >
          Prospect replied
        </button>
      </div>

      <ReplyComposer
        isOpen={isReplyOpen}
        draft={replyDraft}
        isLoading={isReplyLoading}
        messageId={message.id}
        thread={thread}
        onDraftChangeAction={onReplyDraftChangeAction}
        onGenerateFollowUpAction={onGenerateFollowUpAction}
        originalMessage={message.content}
      />
    </article>
  );
}