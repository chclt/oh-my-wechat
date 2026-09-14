import type { SearchMessagesResponse } from "@repo/types/adapter";
import { memo } from "react";
import { getMessageKey } from "../../-lib/message-key";
import { MessageResultItem } from "./message-result-item.tsx";
import { useMessageResultDetails } from "./use-message-result-details.ts";

interface MessageResultPageProps {
	accountId: string;
	data: Awaited<SearchMessagesResponse>["data"];
}

export const MessageResultPage = memo(function MessageResultPage({
	accountId,
	data,
}: MessageResultPageProps) {
	const { chatsById, usersById } = useMessageResultDetails(accountId, data);

	return (
		<>
			{data.map((messageResult) => (
				<MessageResultItem
					key={getMessageKey(
						messageResult.chatId,
						messageResult.messageLocalId,
					)}
					accountId={accountId}
					messageResult={messageResult}
					chat={chatsById.get(messageResult.chatId)}
					senderUser={
						messageResult.userId
							? usersById.get(messageResult.userId)
							: undefined
					}
				/>
			))}
		</>
	);
});
