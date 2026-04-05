import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat.ts";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useContentParser } from "./libs";
import type { PatMessageProps } from "./types";

export function PatMessageAbstract({
	accountId,
	message,
	...props
}: PatMessageProps) {
	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, message.chat_id),
	);

	const records = useContentParser(message, chat, accountId);

	const lastRecord = records.at(-1);

	if (!lastRecord) return null;

	return <p>{...lastRecord}</p>;
}
