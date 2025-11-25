import type { RecordType } from "@/components/record/record";
import type {
	AccountType,
	AppMessageTypeEnum,
	ChatType,
	ContactType,
	FileInfo,
	ImageInfo,
	ImageInfoNext,
	MessageType,
	MessageTypeEnum,
	UserType,
	VerityMessageType,
	VideoInfo,
	VideoInfoNext,
	VoiceInfo,
} from "@/schema";
import type { ChatStatistics } from "./ios-backup/controllers/statistic";

export interface GetUserRequest {
	accountId: string;
	userId: string;
}

export interface GetUserListRequest {
	userIds: string[];
}

export interface GetAccountContactListRequest {
	// TODO: 其他接口也应该传 accountId
	accountId: string;
}

export interface GetMessageListRequest {
	chatId: ChatType["id"];
	type?: MessageTypeEnum | MessageTypeEnum[];
	type_app?: AppMessageTypeEnum | AppMessageTypeEnum[]; // 有 bug
	cursor?: string;
	limit: number;
}

export interface GetGreetingMessageListRequest {
	accountId: string;
}

export interface GetChatRequest {
	chatId: string;
}

export interface GetChatListRequest {
	userIds?: string[];
}

export interface GetImageRequest {
	message: MessageType;
	record?: RecordType;
	size?: "origin" | "thumb";
	domain?: "image" | "opendata" | "video";
}

export interface GetVideoRequest {
	message: MessageType;
}

export interface GetVoiceRequest {
	message: MessageType;
	scope?: "all" | "transcription";
}

export interface GetAttachRequest {
	message: MessageType;
	record?: RecordType;
	type?: string;
}

export interface GetNoteMessageImageRequest {
	accountId: string;
	message: MessageType;
	record: RecordType;
}

export interface GetNoteMessageVideoRequest {
	accountId: string;
	message: MessageType;
	record: RecordType;
}

export interface GetNoteMessageFileRequest {
	accountId: string;
	message: MessageType;
	record: RecordType;
}

export interface GetStatisticRequest {
	chatId: ChatType["id"];
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

	getAccountContactList: (
		requestData: GetAccountContactListRequest,
	) => Promise<DataAdapterResponse<ContactType[]>>;

	getChat: (
		requestData: GetChatRequest,
	) => Promise<DataAdapterResponse<ChatType>>;

	getChatList: (
		requestData: GetChatListRequest,
	) => Promise<DataAdapterResponse<ChatType[]>>;

	getMessageList: (
		requestData: GetMessageListRequest,
	) => Promise<DataAdapterCursorPagination<MessageType[]>>;

	getGreetingMessageList: (
		requestData: GetGreetingMessageListRequest,
	) => Promise<DataAdapterResponse<VerityMessageType[]>>;

	getImage: (
		requestData: GetImageRequest,
	) => Promise<DataAdapterResponse<ImageInfo>>;

	getVideo: (
		requestData: GetVideoRequest,
	) => Promise<DataAdapterResponse<VideoInfo>>;

	getVoice: (
		requestData: GetVoiceRequest,
	) => Promise<DataAdapterResponse<VoiceInfo>>;

	getAttach: (
		requestData: GetAttachRequest,
	) => Promise<DataAdapterResponse<FileInfo[]>>;

	getNoteMessageImage: (
		requestData: GetNoteMessageImageRequest,
	) => Promise<DataAdapterResponse<ImageInfoNext>>;

	getNoteMessageVideo: (
		requestData: GetNoteMessageVideoRequest,
	) => Promise<DataAdapterResponse<VideoInfoNext>>;

	getNoteMessageFile: (
		requestData: GetNoteMessageFileRequest,
	) => Promise<DataAdapterResponse<FileInfo | undefined>>;

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
