import type { ChatType, UserType } from "@repo/types";
import { SearchMessagesResponse } from "@repo/types/adapter";
import { Link, useMatch } from "@tanstack/react-router";
import { format } from "date-fns";
import { memo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { requestMessagePosition } from "../../-lib/message-target";
import { MessageResultPreview } from "./message-result-preview.tsx";
import { getUserDisplayName } from "./message-result-utils";

interface MessageResultItemProps {
	accountId: string;
	messageResult: Awaited<SearchMessagesResponse>["data"][number];
	chat: ChatType | undefined;
	senderUser: UserType | undefined;
}

export const MessageResultItem = memo(function MessageResultItem({
	accountId,
	messageResult,
	chat,
	senderUser,
}: MessageResultItemProps) {
	const isChatroom = chat?.type === "chatroom";
	const isCurrentChat = useMatch({
		from: "/$accountId/chat/$chatId",
		shouldThrow: false,
		select: (match) =>
			match.params.accountId === accountId &&
			match.params.chatId === messageResult.chatId,
	});

	return (
		<li>
			<Link
				to="/$accountId/chat/$chatId"
				params={{ accountId, chatId: messageResult.chatId }}
				replace={isCurrentChat ?? false}
				resetScroll={false}
				state={requestMessagePosition}
				search={(search) => ({
					...search,
					messageLocalId: messageResult.messageLocalId,
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
						<MessageResultPreview
							text={messageResult.messagePlainText}
							match={messageResult.match}
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
		prevResult.chatId === nextResult.chatId &&
		prevResult.messageLocalId === nextResult.messageLocalId &&
		prevResult.createTime === nextResult.createTime &&
		prevResult.messagePlainText === nextResult.messagePlainText &&
		prevResult.match.start === nextResult.match.start &&
		prevResult.match.end === nextResult.match.end &&
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
