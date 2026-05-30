// types for prospects and generator panel props
export type OfferingOption = {
  id: string;
  name: string;
  content: string;
};

export type MessageItem = {
  id: string;
  content: string;
  rating: number | null;
  isFavourite: boolean;
};

export type ConversationTurn = {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
};

export type GeneratorPanelProps = {
  prospectId: string;
  extractedContext: string;
  offerings: OfferingOption[];
  userPrompt: string | null;
  initialMessages: MessageItem[];
};