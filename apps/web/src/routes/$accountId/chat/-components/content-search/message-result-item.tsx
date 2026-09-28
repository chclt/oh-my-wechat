import { SearchMessagesResponse } from "@repo/types/adapter";
import { Link, useMatch } from "@tanstack/react-router";
import clsx from "clsx";
import { format } from "date-fns";
import type { HTMLAttributes, ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import User from "@/components/user";
import { requestMessagePosition } from "../../-lib/message-target";
import { MessageResultPreview } from "./message-result-preview.tsx";

interface MessageResultItemProps {
	accountId: string;
	messageResult: Awaited<SearchMessagesResponse>["data"][number];
	extraSectionProps?: HTMLAttributes<HTMLDivElement>;
	extraSection?: ReactNode;
}

export function MessageResultItem({
	accountId,
	messageResult,
	extraSectionProps: {
		className: extraSectionClassName,
		...extraSectionProps
	} = {},
	extraSection,
}: MessageResultItemProps) {
	const { chat, from } = messageResult;
	const isChatroom = chat.type === "chatroom";
	const chatTitle = chat.title;
	const isCurrentChat = useMatch({
		from: "/$accountId/chat/$chatId",
		shouldThrow: false,
		select: (match) =>
			match.params.accountId === accountId && match.params.chatId === chat.id,
	});

	return (
		<li className="relative hover:bg-muted">
			<Link
				to="/$accountId/chat/$chatId"
				params={{ accountId, chatId: chat.id }}
				replace={isCurrentChat ?? false}
				resetScroll={false}
				state={requestMessagePosition}
				search={(search) => ({
					...search,
					messageLocalId: messageResult.messageLocalId,
				})}
				aria-label={`${chatTitle}：${messageResult.messagePlainText}`}
				className="absolute inset-0"
			/>
			<div className="relative pointer-events-none grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2.5">
				<div className="py-2.5 ps-2.5">
					<Avatar
						src={chat.photo}
						className={[
							"w-12 h-12 clothoid-corner-2 bg-[#DDDFE0]",
							isChatroom
								? "relative after:absolute after:inset-0 after:rounded-[inherit] after:border-2 after:border-[#DDDFE0]"
								: "",
						].join(" ")}
					/>
				</div>

				<div className="min-w-0 py-2.5 pe-5 border-b border-muted">
					<div className="flex items-start gap-2">
						<div className="min-w-0 flex-1 truncate font-medium">
							{chatTitle}
						</div>
						<time className="shrink-0 text-xs text-neutral-400">
							{format(
								new Date(messageResult.createTime * 1000),
								"yyyy/MM/dd HH:mm",
							)}
						</time>
					</div>
					<div className="mt-1 min-w-0 line-clamp-2 break-all text-sm text-neutral-600">
						{isChatroom && (
							<>
								<User user={from} variant="inline" />
								{": "}
							</>
						)}
						<MessageResultPreview
							text={messageResult.messagePlainText}
							match={messageResult.match}
						/>
					</div>
					{extraSection && (
						<div
							className={clsx(
								"pointer-events-auto w-fit",
								extraSectionClassName,
							)}
							{...extraSectionProps}
						>
							{extraSection}
						</div>
					)}
				</div>
			</div>
		</li>
	);
}
