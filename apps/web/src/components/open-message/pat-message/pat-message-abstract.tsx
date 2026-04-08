import { useSuspenseQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat.ts";
import { useContentParser } from "./libs";
import type { PatMessageProps } from "./types";

export function PatMessageAbstract({ message, ...props }: PatMessageProps) {
	const { accountId } = useAccount();

	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, message.chat_id),
	);

	const records = useContentParser(message, chat);

	const lastRecord = records.at(-1);

	if (!lastRecord) return null;

	return <p>{...lastRecord}</p>;
}
