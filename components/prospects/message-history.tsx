"use client";

import { MessageCard } from "./message-card";
import type { ConversationTurn, MessageItem } from "./types";

type Props = {
  messages: MessageItem[];
  openReplyFor: string | null;
  replyDraft: string;
  replyLoadingFor: string | null;
  threadByMessage: Record<string, ConversationTurn[]>;
  onOpenReplyAction: (messageId: string, originalMessage: string) => void;
  onReplyDraftChangeAction: (value: string) => void;
  onGenerateFollowUpAction: (messageId: string, originalMessage: string) => void;
  onCopyAction: (content: string) => void;
  onRateAction: (messageId: string, rating: number) => void;
  onToggleFavouriteAction: (messageId: string, isFavourite: boolean) => void;
  onDeleteAction: (messageId: string) => void;
};

export function MessageHistory({
  messages,
  openReplyFor,
  replyDraft,
  replyLoadingFor,
  threadByMessage,
  onOpenReplyAction,
  onReplyDraftChangeAction,
  onGenerateFollowUpAction,
  onCopyAction,
  onRateAction,
  onToggleFavouriteAction,
  onDeleteAction,
}: Props) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <h3 className="text-sm font-semibold">Message history</h3>

      {messages.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No messages yet.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              isReplyOpen={openReplyFor === message.id}
              replyDraft={replyDraft}
              isReplyLoading={replyLoadingFor === message.id}
              thread={threadByMessage[message.id] ?? []}
              onOpenReplyAction={onOpenReplyAction}
              onReplyDraftChangeAction={onReplyDraftChangeAction}
              onGenerateFollowUpAction={onGenerateFollowUpAction}
              onCopyAction={onCopyAction}
              onRateAction={onRateAction}
              onToggleFavouriteAction={onToggleFavouriteAction}
              onDeleteAction={onDeleteAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
