import type { AccountType } from "@/lib/schema";
import type {
	ChatType,
	ControllerPaginatorResult,
	ControllerResult,
	MessageType,
} from "@/lib/schema";
import type { AttachController } from "./ios-backup/controllers/attach";
import type { ImageController } from "./ios-backup/controllers/image";
import type { MessageController } from "./ios-backup/controllers/message";
import type { StatisticController } from "./ios-backup/controllers/statistic";
import type { VideoController } from "./ios-backup/controllers/video";
import type { VoiceController } from "./ios-backup/controllers/voice";

export interface DataAdapter {
	init: () => void;

	getAccountList: (...input: any[]) => Promise<ControllerResult<AccountType[]>>;

	getAccount: (accountId: string) => Promise<ControllerResult<AccountType>>;

	getChatList: (input?: {
		userIds?: string[];
	}) => Promise<ControllerResult<ChatType[]>>;

	getMessageList: (
		input: MessageController.AllInput[0],
	) => Promise<ControllerPaginatorResult<MessageType[]>>;

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
}
