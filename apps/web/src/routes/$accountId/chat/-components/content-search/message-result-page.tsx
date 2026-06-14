import { SearchMessagesResponse } from "@repo/types/adapter";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Fragment, FragmentProps } from "react";
import { useAccount } from "@/components/account-provider.tsx";
import { ChatListQueryOptions } from "@/lib/fetchers/chat.ts";
import { UserListQueryOptions } from "@/lib/fetchers/user.ts";
import { MessageResultItem } from "./message-result-item.tsx";

interface MessageResultPageProps extends FragmentProps {
	data: Awaited<SearchMessagesResponse>["data"];
	query: string;
}

export function MessageResultPage({
	data,
	query,
	...props
}: MessageResultPageProps) {
	const { accountId } = useAccount();

	const chatIdList = data
		.map((message) => message.chatId)
		.filter((chatId): chatId is string => Boolean(chatId));
	const { data: chatList } = useSuspenseQuery(
		ChatListQueryOptions(accountId, chatIdList),
	);
	const chatListById = new Map(chatList.map((chat) => [chat.id, chat]));

	const userIdList = data
		.map((message) => message.userId)
		.filter((userId): userId is string => Boolean(userId));
	const { data: userList } = useSuspenseQuery(
		UserListQueryOptions(accountId, userIdList),
	);
	const userListById = new Map(userList.map((user) => [user.id, user]));

	return (
		<Fragment {...props}>
			{data.map((messageResult) => (
				<MessageResultItem
					key={`${messageResult.chatId}/${messageResult.messageLocalId}`}
					accountId={accountId}
					query={query}
					messageResult={messageResult}
					chat={chatListById.get(messageResult.chatId)}
					senderUser={
						messageResult.userId
							? userListById.get(messageResult.userId)
							: undefined
					}
				/>
			))}
		</Fragment>
	);
}
