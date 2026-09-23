import type { UserType } from "@repo/types";
import type {
	SearchChatsRequest,
	SearchChatsResponse,
} from "@repo/types/adapter";
import { isChatVisible } from "@repo/utils";
import type { WCDatabases } from "../types";
import * as ChatController from "./chat.ts";
import * as UserController from "./user.ts";

export type SearchChatsInput = [
	SearchChatsRequest,
	{ account: UserType; databases: WCDatabases },
];
export type SearchChatsOutput = SearchChatsResponse;

function normalize(value: string | undefined): string {
	return value?.normalize("NFKC").trim().toLocaleLowerCase() ?? "";
}

function compact(value: string): string {
	return value.replace(/\s+/g, "");
}

export async function searchChats(
	...inputs: SearchChatsInput
): SearchChatsOutput {
	const [request, context] = inputs;
	const { offset, limit } = request;
	const query = normalize(request.query);

	if (!query) {
		return { data: [], meta: { total: 0, offset, limit } };
	}

	const [{ data: chats }, { data: contacts }] = await Promise.all([
		ChatController.all(context),
		UserController.contactList({ databases: context.databases }),
	]);
	const contactsById = new Map(
		contacts.map((contact) => [contact.id, contact]),
	);
	const compactQuery = compact(query);
	const matches = chats.filter((chat) => {
		if (!isChatVisible(chat)) {
			return false;
		}

		const basicValues =
			chat.type === "private"
				? [chat.title, chat.user?.remark, chat.user?.username]
				: [chat.title, chat.chatroom?.remark, chat.chatroom?.title];

		if (basicValues.some((value) => normalize(value).includes(query))) {
			return true;
		}

		const contact = contactsById.get(chat.id);
		if (!contact) {
			return false;
		}

		return [
			contact.usernamePinyin,
			contact.remarkPinyin,
			contact.remarkPinyinInits,
		].some((value) => compact(normalize(value)).includes(compactQuery));
	});

	return {
		data: matches.slice(offset, offset + limit),
		meta: { total: matches.length, offset, limit },
	};
}
