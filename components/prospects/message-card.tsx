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
  onCopyAction: (content: string) => void;
  onRateAction: (messageId: string, rating: number) => void;
  onToggleFavouriteAction: (messageId: string, isFavourite: boolean) => void;
  onDeleteAction: (messageId: string) => void;
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
  onCopyAction,
  onRateAction,
  onToggleFavouriteAction,
  onDeleteAction,
}: Props) {
  return (
    <article className="rounded-md border border-gray-100 p-3">
      <p className="whitespace-pre-wrap text-sm text-gray-800">{message.content}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCopyAction(message.content)}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
        >
          Copy
        </button>

        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRateAction(message.id, star)}
            className={`rounded-md px-2 py-1 text-xs ${
              message.rating === star ? "bg-black text-white" : "border border-gray-300"
            }`}
          >
            {star}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onToggleFavouriteAction(message.id, !message.isFavourite)}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
        >
          {message.isFavourite ? "Unfavourite" : "Favourite"}
        </button>

        <button
          type="button"
          onClick={() => onDeleteAction(message.id)}
          className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
        >
          Delete
        </button>
      </div>

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
