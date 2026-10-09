import type { UserType } from "@repo/types";
import {
	SearchMessagesRequest,
	SearchMessagesResponse,
} from "@repo/types/adapter";
import { getUnixTime, parseISO } from "date-fns";
import type { MessageSearchIndex } from "../database/fts/message-search-index.ts";
import type { WCDatabases } from "../types.ts";
import { createUnknownMessageSender } from "../utils/message.ts";
import * as ChatController from "./chat.ts";
import * as UserController from "./user.ts";

export type SearchMessagesInput = [
	SearchMessagesRequest,
	{
		account: UserType;
		databases: WCDatabases;
		messageSearchIndex: MessageSearchIndex;
	},
];

export type SearchMessagesOutput = SearchMessagesResponse;

export async function searchMessages(
	...inputs: SearchMessagesInput
): SearchMessagesOutput {
	const [request, { messageSearchIndex, account, databases }] = inputs;

	const { offset, limit } = request;
	const startTime = parseOptionalIsoTime(request.startTime);
	const endTime = parseOptionalIsoTime(request.endTime);

	// TODO: 按 request.user 过滤发送者。
	const { hits, totalCount } = await messageSearchIndex.search({
		searchText: request.searchText ?? "",
		chatId: request.chat?.id,
		startTime,
		endTime,
		offset,
		limit,
	});

	const { data: chats } = await ChatController.find(
		{ ids: [...new Set(hits.map((hit) => hit.chatId))] },
		{ account, databases },
	);
	const { data: users } = await UserController.findAll(
		{ ids: [...new Set(hits.map((hit) => hit.senderId))] },
		{ account, databases },
	);
	const chatsById = new Map(chats.map((chat) => [chat.id, chat]));
	const usersById = new Map(
		(users as UserType[]).map((user) => [user.id, user]),
	);
	const data: Awaited<SearchMessagesOutput>["data"] = hits.map((hit) => ({
		chat: chatsById.get(hit.chatId)!,
		from:
			usersById.get(hit.senderId) ?? createUnknownMessageSender(hit.senderId),
		messageLocalId: hit.messageLocalId,
		createTime: hit.createTime,
		messagePlainText: hit.messagePlainText,
		match: hit.match,
		relevance: hit.relevance,
		matchCount: hit.matchCount,
	}));

	return {
		data,
		meta: { total: totalCount, offset, limit },
	};
}

function parseOptionalIsoTime(isoTime: string | undefined): number | undefined {
	// TODO: Preserve ISO sub-second boundaries; flooring can include a message before startTime.
	return isoTime === undefined ? undefined : getUnixTime(parseISO(isoTime));
}
