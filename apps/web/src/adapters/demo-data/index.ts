import {
	ContactList,
	user_0,
	UserList,
} from "@/adapters/demo-data/dataset/user.ts";
import type {
	AccountType,
	ChatType,
	ContactType,
	MessageType,
	UserType,
} from "@/schema";
import {
	DataAdapter,
	DataAdapterCursorPagination,
	DataAdapterResponse,
	GetAttachRequest,
	GetChatRequest,
	GetGreetingMessageListRequest,
	GetImageRequest,
	GetMessageListRequest,
	GetStatisticRequest,
	GetUserListRequest,
	GetUserRequest,
	GetVideoRequest,
	GetVoiceRequest,
} from "../adapter.ts";
import { ChatList } from "./dataset/chat.ts";
import { user_1_message } from "./dataset/message.ts";

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
		const user = UserList.find((user) => user.id === input.userId);

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

	async getImage(input: GetImageRequest) {}

	async getVideo(input: GetVideoRequest) {}

	async getVoice(input: GetVoiceRequest) {}

	async getAttach(input: GetAttachRequest) {}

	async getStatistic(input: GetStatisticRequest) {}
}
