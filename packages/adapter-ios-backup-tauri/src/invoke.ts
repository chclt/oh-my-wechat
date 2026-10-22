import type {
	GetMessageImageRequest,
	GetMessageImageResponse,
	GetMessageVideoRequest,
	GetMessageVideoResponse,
	GetMessageVoiceRequest,
	GetMessageVoiceResponse,
	GetMessageAttachRequest,
	GetMessageAttachResponse,
	GetRecordImageRequest,
	GetRecordImageResponse,
	GetRecordVideoRequest,
	GetRecordVideoResponse,
	GetRecordAudioRequest,
	GetRecordAudioResponse,
	GetRecordFileRequest,
	GetRecordFileResponse,
	ResolveMessageFileRequest,
	ReleaseMessageFileRequest,
	GetAccountContactListResponse,
	GetAccountListResponse,
	GetAccountResponse,
	GetChatListResponse,
	GetMessageListRequest,
	GetMessageListResponse,
	GetGreetingMessageListResponse,
	GetUserListResponse,
	SearchMessagesRequest,
	SearchMessagesResponse,
	GetMessageSearchIndexStatusResponse,
	SearchChatsResponse,
} from "@repo/types/adapter";
import { invoke as tauriInvoke } from "@tauri-apps/api/core";

// Keep these signatures aligned with rust-ios-backup/src/commands.rs.
interface Commands {
	search_messages: (args: {
		request: Omit<SearchMessagesRequest, "startTime" | "endTime"> & {
			startTime?: number;
			endTime?: number;
		};
	}) => Awaited<SearchMessagesResponse>;
	get_message_search_index_status: (args: {
		accountId: string;
	}) => Awaited<GetMessageSearchIndexStatusResponse>;
	get_greeting_message_list: (args: {
		accountId: string;
		includeDev: boolean;
	}) => Awaited<GetGreetingMessageListResponse>;
	get_record_image: (args: {
		request: GetRecordImageRequest;
	}) => Awaited<GetRecordImageResponse>;
	get_record_video: (args: {
		request: GetRecordVideoRequest;
	}) => Awaited<GetRecordVideoResponse>;
	get_record_audio: (args: {
		request: GetRecordAudioRequest;
	}) => Awaited<GetRecordAudioResponse>;
	get_record_file: (args: {
		request: GetRecordFileRequest;
	}) => Awaited<GetRecordFileResponse>;
	get_message_image: (args: {
		request: GetMessageImageRequest;
	}) => Awaited<GetMessageImageResponse>;
	get_message_video: (args: {
		request: GetMessageVideoRequest;
	}) => Awaited<GetMessageVideoResponse>;
	get_message_voice: (args: {
		request: GetMessageVoiceRequest;
	}) => Awaited<GetMessageVoiceResponse>;
	get_message_attach: (args: {
		request: GetMessageAttachRequest;
	}) => Awaited<GetMessageAttachResponse>;
	resolve_message_file: (args: { request: ResolveMessageFileRequest }) => {
		data: { src: string; mimeType: string };
	};
	release_message_file: (args: { request: ReleaseMessageFileRequest }) => null;
	show_directory_picker: () => string | null;
	load_backup_directory: (args: {
		directory: string;
		password?: string;
	}) => null;
	unload_backup_directory: () => null;
	load_account_database: (args: { accountId: string }) => null;
	unload_account_database: () => null;
	get_account_list: () => Awaited<GetAccountListResponse>;
	get_account: (args: { accountId: string }) => Awaited<GetAccountResponse>;
	get_account_contact_list: (args: {
		accountId: string;
	}) => Awaited<GetAccountContactListResponse>;
	get_chat_list: (args: {
		accountId: string;
		userIds?: string[];
	}) => Awaited<GetChatListResponse>;
	get_user_list: (args: {
		accountId: string;
		userIds: string[];
	}) => Awaited<GetUserListResponse>;
	search_chats: (args: {
		accountId: string;
		query: string;
		offset: number;
		limit: number;
		language: string;
	}) => Awaited<SearchChatsResponse>;
	get_message_list: (args: {
		request: GetMessageListRequest;
	}) => Awaited<GetMessageListResponse>;
}

export async function invoke<Command extends keyof Commands>(
	command: Command,
	...args: Parameters<Commands[Command]>
): Promise<ReturnType<Commands[Command]>> {
	try {
		return await tauriInvoke<ReturnType<Commands[Command]>>(command, args[0]);
	} catch (cause) {
		// Rust commands return BackupError; Tauri itself can reject with a string.
		const failure = cause as { name: string; message: string } | string;
		if (typeof failure === "string") throw new Error(failure);
		const error = new Error(failure.message);
		error.name = failure.name;
		throw error;
	}
}
