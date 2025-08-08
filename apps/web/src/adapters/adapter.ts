import type {
	AccountType,
	AppMessageTypeEnum,
	FileInfo,
	MessageTypeEnum,
	PhotpSize,
	UserType,
	VideoInfo,
	VoiceInfo,
} from "@/schema";
import type { ChatType, MessageType } from "@/schema";
import type { ChatStatistics } from "./ios-backup/controllers/statistic";
import type { RecordType } from "@/components/record/record";

export interface GetUserRequest {
	userId: string;
}

export interface GetUserListRequest {
	userIds: string[];
}

export interface GetMessageListRequest {
	chat: ChatType;
	type?: MessageTypeEnum | MessageTypeEnum[];
	type_app?: AppMessageTypeEnum | AppMessageTypeEnum[]; // 有 bug
	cursor?: string;
	limit: number;
}

export interface GetChatRequest {
	chatId: string;
}

export interface GetChatListRequest {
	userIds?: string[];
}

export interface GetImageRequest {
	chat: ChatType;
	message: MessageType;
	record?: RecordType;
	size?: "origin" | "thumb";
	domain?: "image" | "opendata" | "video";
}

export interface GetVideoRequest {
	chat: ChatType;
	message: MessageType;
}

export interface GetVoiceRequest {
	chat: ChatType;
	message: MessageType;
	scope?: "all" | "transcription";
}

export interface GetAttachRequest {
	chat: ChatType;
	message: MessageType;
	record?: RecordType;
	type?: string;
}

export interface GetStatisticRequest {
	chat: ChatType;
	startTime: Date;
	endTime: Date;
}

export interface DataAdapter {
	init: () => void;

	getAccountList: (
		...requestData: any[]
	) => Promise<DataAdapterResponse<AccountType[]>>;

	getAccount: (accountId: string) => Promise<DataAdapterResponse<AccountType>>;

	getUser: (
		requestData: GetUserRequest,
	) => Promise<DataAdapterResponse<UserType>>;

	getUserList: (
		requestData: GetUserListRequest,
	) => Promise<DataAdapterResponse<UserType[]>>;

	getChat: (
		requestData: GetChatRequest,
	) => Promise<DataAdapterResponse<ChatType>>;

	getChatList: (
		requestData: GetChatListRequest,
	) => Promise<DataAdapterResponse<ChatType[]>>;

	getMessageList: (
		requestData: GetMessageListRequest,
	) => Promise<DataAdapterCursorPagination<MessageType[]>>;

	getImage: (
		requestData: GetImageRequest,
	) => Promise<DataAdapterResponse<PhotpSize[]>>;

	getVideo: (
		requestData: GetVideoRequest,
	) => Promise<DataAdapterResponse<VideoInfo>>;

	getVoice: (
		requestData: GetVoiceRequest,
	) => Promise<DataAdapterResponse<VoiceInfo>>;

	getAttach: (
		requestData: GetAttachRequest,
	) => Promise<DataAdapterResponse<FileInfo[]>>;

	getStatistic: (
		requestData: GetStatisticRequest,
	) => Promise<DataAdapterResponse<ChatStatistics>>;
}

export interface DataAdapterResponse<DataType> {
	data: DataType;
	meta?: Record<string, any>;
}

export interface DataAdapterCursorPagination<DataType>
	extends DataAdapterResponse<DataType> {
	meta: {
		cursor?: string;
		previous_cursor?: string;
		next_cursor?: string;
	};
}
