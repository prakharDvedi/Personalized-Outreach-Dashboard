export type SaveMessageInput = {
  prospectId: string;
  offeringId: string;
  content: string;
};

export type RateMessageInput = {
  messageId: string;
  rating: number | null;
};

export type ToggleFavouriteInput = {
  messageId: string;
  isFavourite: boolean;
};
