import type { ChatType, UserType } from "@repo/types";
import { SearchMessagesResponse } from "@repo/types/adapter";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { memo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { getUserDisplayName } from "./message-result-utils";

interface MessageResultItemProps {
	accountId: string;
	query: string;
	messageResult: Awaited<SearchMessagesResponse>["data"][number];
	chat: ChatType | undefined;
	senderUser: UserType | undefined;
}

export const MessageResultItem = memo(function MessageResultItem({
	accountId,
	query,
	messageResult,
	chat,
	senderUser,
}: MessageResultItemProps) {
	const isChatroom = chat?.type === "chatroom";

	return (
		<li>
			<Link
				to="/$accountId/chat/$chatId"
				params={{ accountId, chatId: messageResult.chatId }}
				search={(search) => ({
					...search,
					messageLocalId: messageResult.messageLocalId, // TODO
				})}
				className="flex gap-2.5 hover:bg-muted"
			>
				<div className="shrink-0 py-2.5 ps-2.5">
					<Avatar
						src={chat?.photo}
						className={[
							"w-12 h-12 clothoid-corner-2 bg-[#DDDFE0]",
							chat?.type === "chatroom"
								? "relative after:absolute after:inset-0 after:rounded-[inherit] after:border-2 after:border-[#DDDFE0]"
								: "",
						].join(" ")}
					/>
				</div>

				<div className="min-w-0 flex-grow py-2.5 pe-5 border-b border-muted">
					<div className="flex items-start gap-2">
						<div className="min-w-0 flex-1 truncate font-medium">
							{chat?.title || messageResult.chatId || "未知聊天"}
						</div>
						<time className="shrink-0 text-xs text-neutral-400">
							{format(
								new Date(messageResult.createTime * 1000),
								"yyyy/MM/dd HH:mm",
							)}
						</time>
					</div>
					<div className="mt-1 min-w-0 text-sm text-neutral-600">
						{isChatroom && senderUser && (
							<span className="me-1 inline-flex max-w-full align-top">
								<Avatar
									src={senderUser.photo?.thumb}
									variant="inline"
									className="me-1"
								/>
								<span className="truncate">
									{getUserDisplayName(senderUser)}：
								</span>
							</span>
						)}
						<HighlightedText
							text={messageResult.messagePlainText}
							query={query}
						/>
					</div>
				</div>
			</Link>
		</li>
	);
}, areMessageResultItemPropsEqual);

function areMessageResultItemPropsEqual(
	prevProps: MessageResultItemProps,
	nextProps: MessageResultItemProps,
) {
	const prevResult = prevProps.messageResult;
	const nextResult = nextProps.messageResult;

	return (
		prevProps.accountId === nextProps.accountId &&
		prevProps.query === nextProps.query &&
		prevResult.chatId === nextResult.chatId &&
		prevResult.messageLocalId === nextResult.messageLocalId &&
		prevResult.createTime === nextResult.createTime &&
		prevResult.messagePlainText === nextResult.messagePlainText &&
		prevProps.chat?.title === nextProps.chat?.title &&
		prevProps.chat?.photo === nextProps.chat?.photo &&
		prevProps.chat?.type === nextProps.chat?.type &&
		prevProps.senderUser?.photo?.thumb === nextProps.senderUser?.photo?.thumb &&
		getOptionalUserDisplayName(prevProps.senderUser) ===
			getOptionalUserDisplayName(nextProps.senderUser)
	);
}

function getOptionalUserDisplayName(user: UserType | undefined) {
	return user ? getUserDisplayName(user) : undefined;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
	const index = text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase());
	if (index < 0 || query.length === 0) {
		return <span className="line-clamp-2 break-all">{text}</span>;
	}

	const before = text.slice(0, index);
	const match = text.slice(index, index + query.length);
	const after = text.slice(index + query.length);

	return (
		<span className="line-clamp-2 break-all">
			{before}
			<span className="text-orange-500">{match}</span>
			{after}
		</span>
	);
}
