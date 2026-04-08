import { useSuspenseQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat.ts";
import { useContentParser } from "./libs";
import type { PatMessageProps } from "./types";

export function PatMessageDefault({ message, ...props }: PatMessageProps) {
	const { accountId } = useAccount();

	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, message.chat_id),
	);

	const records = useContentParser(message, chat);

	return (
		<>
			{records.map((record, index) => (
				<div
					key={index}
					className={
						"mx-auto px-14 text-sm text-center text-pretty text-neutral-600"
					}
					{...props}
				>
					<p>{...record}</p>
				</div>
			))}
		</>
	);
}
