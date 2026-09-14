import {
	SearchMessagesRequest,
	SearchMessagesResponse,
} from "@repo/types/adapter";
import { getUnixTime, parseISO } from "date-fns";
import type { MessageSearchIndex } from "../database/fts/message-search-index.ts";

export type SearchMessagesInput = [
	SearchMessagesRequest,
	{ messageSearchIndex: MessageSearchIndex },
];

export type SearchMessagesOutput = SearchMessagesResponse;

export async function searchMessages(
	...inputs: SearchMessagesInput
): SearchMessagesOutput {
	const [request, { messageSearchIndex }] = inputs;

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

	const data: Awaited<SearchMessagesOutput>["data"] = hits.map((hit) => ({
		chatId: hit.chatId,
		messageLocalId: hit.messageLocalId,
		createTime: hit.createTime,
		messagePlainText: hit.messagePlainText,
		match: hit.match,
		relevance: hit.relevance,
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
