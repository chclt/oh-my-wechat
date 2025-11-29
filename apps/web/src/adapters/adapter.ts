import type {
	AccountType,
	AppMessageTypeEnum,
	ChatType,
	ContactType,
	FileInfo,
	ImageInfo,
	MessageType,
	MessageTypeEnum,
	UserType,
	VerityMessageType,
	VideoInfo,
	VoiceInfo,
} from "@/schema";
import { MessageRecordBaseType } from "@/schema/message-record.ts";
import type { ChatStatistics } from "./ios-backup/controllers/statistic";

// export interface GetAccountListRequest {}

export type GetAccountListResponse = Promise<
	DataAdapterResponse<AccountType[]>
>;

export interface GetAccountRequest {
	account: { id: string };
}

export type GetAccountResponse = Promise<DataAdapterResponse<AccountType>>;

export interface GetUserRequest {
	accountId: string;
	userId: string;
}

export type GetUserResponse = Promise<DataAdapterResponse<UserType>>;

export interface GetUserListRequest {
	userIds: string[];
}

export type GetUserListResponse = Promise<DataAdapterResponse<UserType[]>>;

export interface GetAccountContactListRequest {
	// TODO: 其他接口也应该传 accountId
	accountId: string;
}

export type GetAccountContactListResponse = Promise<
	DataAdapterResponse<ContactType[]>
>;

export interface GetMessageListRequest {
	chatId: ChatType["id"];
	type?: MessageTypeEnum | MessageTypeEnum[];
	type_app?: AppMessageTypeEnum | AppMessageTypeEnum[]; // 有 bug
	cursor?: string;
	limit: number;
}

export type GetMessageListResponse = Promise<
	DataAdapterCursorPagination<MessageType[]>
>;

export interface GetGreetingMessageListRequest {
	accountId: string;
}

export type GetGreetingMessageListResponse = Promise<
	DataAdapterResponse<VerityMessageType[]>
>;

export interface GetChatRequest {
	chatId: string;
}

export type GetChatResponse = Promise<DataAdapterResponse<ChatType>>;

export interface GetChatListRequest {
	userIds?: string[];
}

export type GetChatListResponse = Promise<DataAdapterResponse<ChatType[]>>;

export interface GetMessageImageRequest {
	account: Pick<AccountType, "id">;
	chat: Pick<ChatType, "id">;
	message: Pick<MessageType, "local_id">;
	sizes?: NonNullable<keyof ImageInfo>[];
	domain?: "image" | "opendata";
}

export type GetMessageImageResponse = Promise<
	DataAdapterResponse<ImageInfo | undefined>
>;

export interface GetMessageVideoRequest {
	account: Pick<AccountType, "id">;
	chat: Pick<ChatType, "id">;
	message: Pick<MessageType, "local_id">;
	include?: ("cover" | "video")[];
}

export type GetMessageVideoResponse = Promise<
	DataAdapterResponse<VideoInfo | undefined>
>;

export interface GetMessageVoiceRequest {
	account: Pick<AccountType, "id">;
	chat: Pick<ChatType, "id">;
	message: Pick<MessageType, "local_id">;
	scope?: "all" | "transcription";
}

export type GetMessageVoiceResponse = Promise<
	DataAdapterResponse<VoiceInfo | undefined>
>;

export interface GetMessageAttachRequest {
	account: Pick<AccountType, "id">;
	chat: Pick<ChatType, "id">;
	message: Pick<MessageType, "local_id">;
	type?: string;
}

export type GetMessageAttachResponse = Promise<
	DataAdapterResponse<FileInfo | undefined>
>;

export interface GetRecordImageRequest {
	accountId: string;
	chat: Pick<ChatType, "id">;
	message: Pick<MessageType, "local_id">;
	record: Pick<MessageRecordBaseType, "@_dataid">;
}

export type GetRecordImageResponse = Promise<DataAdapterResponse<ImageInfo>>;

export interface GetRecordVideoRequest {
	accountId: string;
	chat: Pick<ChatType, "id">;
	message: Pick<MessageType, "local_id">;
	record: Pick<MessageRecordBaseType, "@_dataid">;
}

export type GetRecordVideoResponse = Promise<DataAdapterResponse<VideoInfo>>;

export interface GetRecordFileRequest {
	accountId: string;
	chat: Pick<ChatType, "id">;
	message: Pick<MessageType, "local_id">;
	record: Pick<MessageRecordBaseType, "@_dataid">;
}

export type GetRecordFileResponse = Promise<
	DataAdapterResponse<FileInfo | undefined>
>;

export interface GetStatisticRequest {
	chatId: ChatType["id"];
	startTime: Date;
	endTime: Date;
}

export type GetStatisticResponse = Promise<DataAdapterResponse<ChatStatistics>>;

export interface DataAdapter {
	init: () => void;

	getAccountList: (...requestData: any[]) => GetAccountListResponse;

	getAccount: (requestData: GetAccountRequest) => GetAccountResponse;

	getUser: (requestData: GetUserRequest) => GetUserResponse;

	getUserList: (requestData: GetUserListRequest) => GetUserListResponse;

	getAccountContactList: (
		requestData: GetAccountContactListRequest,
	) => GetAccountContactListResponse;

	getChat: (requestData: GetChatRequest) => GetChatResponse;

	getChatList: (requestData: GetChatListRequest) => GetChatListResponse;

	getMessageList: (
		requestData: GetMessageListRequest,
	) => GetMessageListResponse;

	getGreetingMessageList: (
		requestData: GetGreetingMessageListRequest,
	) => GetGreetingMessageListResponse;

	getMessageImage: (
		requestData: GetMessageImageRequest,
	) => GetMessageImageResponse;

	getMessageVideo: (
		requestData: GetMessageVideoRequest,
	) => GetMessageVideoResponse;

	getMessageVoice: (
		requestData: GetMessageVoiceRequest,
	) => GetMessageVoiceResponse;

	getMessageAttach: (
		requestData: GetMessageAttachRequest,
	) => GetMessageAttachResponse;

	// TODO: maybe undefined
	getRecordImage: (
		requestData: GetRecordImageRequest,
	) => GetRecordImageResponse;

	getRecordVideo: (
		requestData: GetRecordVideoRequest,
	) => GetRecordVideoResponse;

	getRecordFile: (requestData: GetRecordFileRequest) => GetRecordFileResponse;

	getStatistic: (requestData: GetStatisticRequest) => GetStatisticResponse;
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
