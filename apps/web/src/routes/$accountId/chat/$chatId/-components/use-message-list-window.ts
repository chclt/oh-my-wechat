import type { MessageType } from "@repo/types";
import type {
	DataAdapterCursorPagination,
	MessageListCursor,
} from "@repo/types/adapter";
import {
	hashKey,
	useQueryClient,
	type InfiniteData,
} from "@tanstack/react-query";
import { useState } from "react";
import { MessageListInfiniteQueryOptions } from "@/lib/fetchers/message";
import {
	getMessageTargetKey,
	type MessageListTarget,
} from "../../-lib/message-target";

type MessagePages = InfiniteData<DataAdapterCursorPagination<MessageType[]>>;

export function selectMessageWindowOrigin(
	origin: MessageListTarget | undefined,
	target: MessageListTarget | undefined,
	data: MessagePages | undefined,
) {
	return target &&
		data &&
		data.pages.some((page) =>
			page.data.some((message) => message.local_id === target.messageLocalId),
		)
		? origin
		: target;
}

export function useMessageListWindow(
	accountId: string,
	chatId: string,
	target: MessageListTarget | undefined,
) {
	const client = useQueryClient();
	const scope = JSON.stringify([accountId, chatId]);
	const targetKey = getMessageTargetKey(target);
	const options = (origin?: MessageListTarget) =>
		MessageListInfiniteQueryOptions({
			account: { id: accountId },
			chat: { id: chatId },
			limit: 20,
			cursor: origin
				? JSON.stringify({
						condition: "<>",
						...origin,
					} satisfies MessageListCursor)
				: undefined,
		});
	const [selection, setSelection] = useState<{
		scope: string;
		targetKey: string | null;
		origin?: MessageListTarget;
	}>({ scope, targetKey: null });
	let current = selection;
	if (selection.scope !== scope || selection.targetKey !== targetKey) {
		const origin = selection.scope === scope ? selection.origin : undefined;
		current = {
			scope,
			targetKey,
			origin: selectMessageWindowOrigin(
				origin,
				target,
				client.getQueryData<MessagePages>(options(origin).queryKey),
			),
		};
		// Select before rendering children: no old list/scroll request is committed for the new target.
		setSelection(current);
	}
	const queryOptions = options(current.origin);
	return { queryOptions, windowKey: hashKey(queryOptions.queryKey) };
}
