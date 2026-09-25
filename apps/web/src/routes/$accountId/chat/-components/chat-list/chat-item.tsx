import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type React from "react";
import { Suspense } from "react";
import { useLocation } from "wouter";
import { Avatar } from "@/components/ui/avatar.tsx";
import { LastMessageQueryOptions } from "@/lib/fetchers/message";
import { cn, formatDateTime } from "@/lib/utils.ts";
import { Route } from "../../route";
import ChatListMessageSummary from "./chat-list-message-summary";
import { ChatListChatGroupItem, ChatListChatItem } from "./use-chat-list";

interface ChatItemProps extends React.HTMLAttributes<HTMLLIElement> {
	chatListItem: ChatListChatItem | ChatListChatGroupItem;
}

export default function ChatListItem({
	chatListItem,
	className,
	...props
}: ChatItemProps) {
	const { accountId } = Route.useParams();

	const [, navigate] = useLocation();

	const { ref: itemRef, inViewport } = useInViewport();

	const { data: last_message } = useQuery({
		...LastMessageQueryOptions({
			account: { id: accountId },
			chat: { id: chatListItem.chat.id },
		}),
		enabled: inViewport,
	});

	return (
		<li ref={itemRef} {...props}>
			<Link
				to="/$accountId/chat/$chatId"
				params={{ accountId, chatId: chatListItem.id }}
				className={cn(
					"box-content p-2.5 h-11 grid grid-cols-[auto_minmax(0,1fr)] content-center items-center gap-4 hover:bg-black/5 [&.active]:bg-black/5",
					className,
				)}
				style={{
					contentVisibility: "auto",
					containIntrinsicSize: "calc(var(--spacing) * 11)",
				}}
				onClick={(event) => {
					if (chatListItem.type === "chatGroup") {
						event.preventDefault();
						event.stopPropagation();
						navigate(`/groups/${encodeURIComponent(chatListItem.id)}`);
					}
				}}
			>
				{chatListItem.photo ? (
					<Avatar
						src={chatListItem.photo}
						className={cn(
							"w-12 h-12 clothoid-corner-2 bg-[#DDDFE0]",
							chatListItem.chat.type === "chatroom"
								? "relative after:absolute after:inset-0 after:rounded-[inherit] after:border-2 after:border-[#DDDFE0]"
								: "",
						)}
					/>
				) : (
					<div className={"w-12 h-12 clothoid-corner-2 bg-[#DDDFE0]"} />
				)}

				<div className="min-w-0">
					<div className="grid grid-flow-col grid-cols-[minmax(0,1fr)] auto-cols-auto gap-2">
						<h4 className={"min-w-0 font-medium line-clamp-1"}>
							{chatListItem.title}
							{/* {(chat.type === "private"
                                ? chat.user.is_openim
                                : chat.chatroom.is_openim) && (
                                <span className="ms-1 text-sm font-normal text-orange-400">
                                @企业微信
                                </span>
                            )} */}
						</h4>
						{last_message && (
							<small className={"ms-2 text-xs text-neutral-400"}>
								{
									formatDateTime(new Date(last_message.date * 1000)).split(
										" ",
									)[0]
								}
							</small>
						)}
					</div>
					<p
						className={
							"min-w-0 min-h-[1.5em] text-sm line-clamp-1 text-neutral-600 [&>*]:inline"
						}
					>
						{last_message && (
							<Suspense fallback={null}>
								<ChatListMessageSummary
									message={last_message}
									showUsername={chatListItem.chat.type === "chatroom"}
								/>
							</Suspense>
						)}
					</p>
				</div>
			</Link>
		</li>
	);
}
