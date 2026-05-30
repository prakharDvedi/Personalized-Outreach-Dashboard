import type { ConversationTurn } from "@/db/schema";

export type AddReplyInput = {
  messageId: string;
  role: "assistant" | "user";
  content: string;
};

export type OwnedMessage = {
  id: string;
  prospectId: string;
};

export type ConversationThread = ConversationTurn[];
