import type {
	GetAccountContactListResponse,
	GetAccountListResponse,
	GetAccountResponse,
	GetChatListResponse,
	GetUserListResponse,
	SearchChatsResponse,
} from "@repo/types/adapter";
import { invoke as tauriInvoke } from "@tauri-apps/api/core";

// Keep these signatures aligned with rust-ios-backup/src/commands.rs.
interface Commands {
	show_directory_picker: () => string | null;
	load_backup_directory: (args: {
		directory: string;
		password?: string;
	}) => null;
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
