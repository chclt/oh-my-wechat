import type {
  Chat,
  ControllerPaginatorResult,
  ControllerResult,
  MessageVM,
  PhotpSize,
  User,
} from "../schema";
import type { AttachController } from "./ios-backup/controllers/attach";
import type { ChatController } from "./ios-backup/controllers/chat";
import type { ImageController } from "./ios-backup/controllers/image";
import type { MessageController } from "./ios-backup/controllers/message";
import type { VideoController } from "./ios-backup/controllers/video";
import type { VoiceController } from "./ios-backup/controllers/voice";

export interface DataAdapterClassType {
  init: () => void;

  getAccountList: (...input: any[]) => Promise<ControllerResult<User[]>>;

  getChatList: (input?: { userIds?: string[] }) => Promise<
    ControllerResult<Chat[]>
  >;

  getMessageList: (
    input: MessageController.AllInput[0],
  ) => Promise<ControllerPaginatorResult<MessageVM[]>>;

  getImage: (
    controllerInput: ImageController.GetInput[0],
  ) => ImageController.GetOutput;

  getVideo: (
    controllerInput: VideoController.GetInput[0],
  ) => VideoController.GetOutput;

  getVoice: (
    controllerInput: VoiceController.GetInput[0],
  ) => VoiceController.GetOutput;

  getAttache: (
    controllerInput: AttachController.GetInput[0],
  ) => AttachController.GetOutput;
}
