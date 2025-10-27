import Image from "@/components/image.tsx";
import Message from "@/components/message/message.tsx";
import { useMiniRouter } from "@/components/mini-router";
import { LastMessageQueryOptions } from "@/lib/fetchers/message";
import { cn, formatDateTime } from "@/lib/utils.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type React from "react";
import { Route } from "../../route";
import { ChatGroupListMiniRouteState } from "./chat-group-list";
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

	const { states: miniRouterStates, pushState: pushMiniRouterState } =
		useMiniRouter();

	const { ref: itemRef, inViewport } = useInViewport();

	const { data: last_message } = useQuery({
		...LastMessageQueryOptions(accountId, {
			chat: chatListItem.chat,
		}),
		enabled: inViewport,
	});

	const handleOpenChatGroup = (
		chatListChatGroupItem: ChatListChatGroupItem,
	) => {
		pushMiniRouterState({
			name: "chatGroupList",
			data: {
				chatListItem: chatListChatGroupItem,
			},
		} satisfies ChatGroupListMiniRouteState);
	};

	return (
		<li key={chatListItem.id} ref={itemRef} {...props}>
			<Link
				to="/$accountId/chat/$chatId"
				params={{ accountId, chatId: chatListItem.id }}
				className={cn(
					"box-content p-2.5 h-11 flex items-center gap-4 hover:bg-black/5 [&.active]:bg-black/5",
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
						handleOpenChatGroup(chatListItem);
					}
				}}
			>
				{chatListItem.photo ? (
					<div
						className={cn(
							"shrink-0 w-12 h-12 clothoid-corner-2",
							chatListItem.chat.type === "chatroom"
								? "relative after:absolute after:inset-0 after:rounded-md after:border-2 after:border-[#DDDFE0]"
								: "",
						)}
					>
						<Image
							width={48}
							height={48}
							className={"w-full h-full bg-[#DDDFE0]"}
							src={chatListItem.photo}
						/>
					</div>
				) : (
					<div className={"shrink-0 w-12 h-12 rounded-lg bg-neutral-300"} />
				)}

				<div className="grow flex flex-col items-stretch">
					<div className="flex gap-2">
						<h4 className={"grow font-medium break-all line-clamp-1"}>
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
					<div
						className={"min-h-[1.5em] text-sm line-clamp-1 text-neutral-600"}
					>
						{last_message && (
							<Message
								variant="abstract"
								message={last_message}
								showUsername={chatListItem.chat.type === "chatroom"}
								className={""}
							/>
						)}
					</div>
				</div>
			</Link>
		</li>
	);
}
