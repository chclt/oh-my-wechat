import { Account } from "@/lib/schema";
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
import { StatisticController } from "./ios-backup/controllers/statistic";
import type { VideoController } from "./ios-backup/controllers/video";
import type { VoiceController } from "./ios-backup/controllers/voice";
import { Wrapped2024Controller } from "./ios-backup/controllers/wrapped-2024";

export interface DataAdapter {
  init: () => void;

  getAccountList: (...input: any[]) => Promise<ControllerResult<Account[]>>;

  getAccount: (accountId: string) => Promise<ControllerResult<Account>>;

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

  getStatistic: (
    controllerInput: StatisticController.GetInput[0],
  ) => StatisticController.GetOutput;

  getWrapped2024: (
    controllerInput: Wrapped2024Controller.Wrapped2024Input[0],
  ) => Wrapped2024Controller.Wrapped2024Output;

  getWrapped2024RandomMediaMessage: (
    controllerInput: Wrapped2024Controller.GetRandomMediaMessageInput[0],
  ) => Wrapped2024Controller.GetRandomMediaMessageOutput;
}
