import {
	SearchMessagesRequest,
	SearchMessagesResponse,
} from "@repo/types/adapter";
import { getUnixTime, isValid, parseISO } from "date-fns";
import {
	MessageSearchIndex,
	type MessageSearchIndexStatus,
} from "../database/fts/message-search-index.ts";
import { buildFullTextMatchExpression } from "../database/fts/tokenizer.ts";

export type SearchMessagesInput = [
	SearchMessagesRequest,
	{ messageSearchIndex: MessageSearchIndex },
];

export type SearchMessagesOutput = SearchMessagesResponse;

export async function searchMessages(
	...inputs: SearchMessagesInput
): SearchMessagesOutput {
	const [request, { messageSearchIndex }] = inputs;

	const offset = Math.max(0, request.offset);
	const limit = Math.max(0, request.limit);
	const startTime = parseOptionalIsoTime(request.startTime, "startTime");
	const endTime = parseOptionalIsoTime(request.endTime, "endTime");

	const matchExpression = buildFullTextMatchExpression(
		request.searchText ?? "",
	);

	if (request.user) {
		// TODO
	}

	if (matchExpression.length === 0) {
		return {
			data: [],
			meta: { total: 0, offset, limit },
		};
	}

	const { hits, totalCount } = await messageSearchIndex.search({
		matchExpression,
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
		relevance: hit.relevance,
	}));

	return {
		data,
		meta: { total: totalCount, offset, limit },
	};
}

function parseOptionalIsoTime(
	isoTime: string | undefined,
	fieldName: "startTime" | "endTime",
): number | undefined {
	if (!isoTime) {
		return undefined;
	}

	const date = parseISO(isoTime);
	if (!isValid(date)) {
		throw new Error(`Invalid search ${fieldName}: ${isoTime}`);
	}

	return getUnixTime(date);
}

export type GetMessageSearchIndexStatusInput = [
	{ messageSearchIndex: MessageSearchIndex },
];

export type GetMessageSearchIndexStatusOutput =
	Promise<MessageSearchIndexStatus>;

export async function getMessageSearchIndexStatus(
	...inputs: GetMessageSearchIndexStatusInput
): GetMessageSearchIndexStatusOutput {
	const [{ messageSearchIndex }] = inputs;
	return messageSearchIndex.getStatus();
}
