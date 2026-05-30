export { listMessagesByProspect } from "./messages/queries";
export { saveMessage, rateMessage, toggleFavourite, deleteMessage } from "./messages/mutations";
export type {
  SaveMessageInput,
  RateMessageInput,
  ToggleFavouriteInput,
} from "./messages/types";
