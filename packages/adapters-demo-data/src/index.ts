import { MessageTypeEnum } from "@repo/types";
import type {
	AccountType,
	ChatType,
	ContactType,
	MessageType,
	UserType,
} from "@repo/types";
import {
	DataAdapter,
	DataAdapterCursorPagination,
	DataAdapterResponse,
	GetChatRequest,
	GetGreetingMessageListRequest,
	GetMessageAttachRequest,
	GetMessageImageRequest,
	GetMessageListRequest,
	GetMessageVideoRequest,
	GetMessageVoiceRequest,
	GetStatisticRequest,
	GetUserListRequest,
	GetUserRequest,
	ReleaseMessageFileRequest,
	ResolveMessageFileRequest,
} from "@repo/types/adapter";
import { ChatList } from "./dataset/chat.ts";
import { ContactList, user_0, UserList } from "./dataset/user.ts";
import { user_1_message } from "./dataset/user_1/messages.ts";

export default class DemoDataAdapter implements DataAdapter {
	constructor() {}

	async init() {}

	async getAccountList() {
		return {
			data: [user_0],
		} satisfies DataAdapterResponse<AccountType[]>;
	}

	async getAccount() {
		return {
			data: user_0,
		} satisfies DataAdapterResponse<AccountType>;
	}

	async getUserList(input: GetUserListRequest) {}

	async getUser(input: GetUserRequest) {
		const user = UserList.find((user) => user.id === input.user.id);

		if (!user) {
			throw new Error("User not found");
		}

		return {
			data: user,
		} satisfies DataAdapterResponse<UserType>;
	}

	async getAccountContactList() {
		return {
			data: ContactList,
		} satisfies DataAdapterResponse<ContactType[]>;
	}

	async getChatList() {
		return {
			data: ChatList,
		} satisfies DataAdapterResponse<ChatType[]>;
	}

	async getChat(input: GetChatRequest) {}

	async getMessageList(input: GetMessageListRequest) {
		return {
			data: user_1_message,
			meta: {
				cursor: undefined,
				previous_cursor: undefined,
				next_cursor: undefined,
			},
		} satisfies DataAdapterCursorPagination<MessageType[]>;
	}

	async getGreetingMessageList(input: GetGreetingMessageListRequest) {}

	async getMessageImage(input: GetMessageImageRequest) {
		const message = user_1_message.find(
			(m) => m.local_id === input.message.local_id,
		);
		if (message?.type === MessageTypeEnum.IMAGE) {
			const uri = (message.message_entity as any)?.msg?.MMAsset
				?.m_assetUrlForSystem as string | undefined;
			if (uri) return { data: { regular: { uri } } };
		}
		return { data: undefined };
	}

	async resolveMessageFile(input: ResolveMessageFileRequest) {
		return { data: { src: input.uri } };
	}

	async releaseMessageFile(input: ReleaseMessageFileRequest) {}

	async getMessageVideo(input: GetMessageVideoRequest) {}

	async getMessageVoice(input: GetMessageVoiceRequest) {}

	async getMessageAttach(input: GetMessageAttachRequest) {}

	async getStatistic(input: GetStatisticRequest) {}
}
