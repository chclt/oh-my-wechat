import type {
  Chat,
  ControllerPaginatorResult,
  ControllerResult,
  MessageVM,
  User,
} from "../schema";
import type { ChatController } from "./ios-backup/controllers/chat";
import type { MessageController } from "./ios-backup/controllers/message";

export interface DataAdapterClassType {
  init: () => void;

  getAccountList: (...input: any[]) => Promise<ControllerResult<User[]>>;

  getChatList: (input?: { userIds?: string[] }) => Promise<
    ControllerResult<Chat[]>
  >;

  getMessageList: (
    input: MessageController.AllInput[0],
  ) => Promise<ControllerPaginatorResult<MessageVM[]>>;
}
