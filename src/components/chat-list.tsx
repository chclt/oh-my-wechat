import Image from "@/components/image.tsx";
import Message from "@/components/message/message.tsx";
import { ChatListSuspenseQueryOptions } from "@/lib/fetchers/chat";
import { LastMessageQueryOptions } from "@/lib/fetchers/message";
import type { ChatType } from "@/schema";
import { cn, formatDateTime } from "@/lib/utils.ts";
import { Route } from "@/routes/$accountId/chat/route";
import { useInViewport } from "@mantine/hooks";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type React from "react";

export default function ChatList() {
	const { accountId } = Route.useParams();

	const { data } = useSuspenseQuery(ChatListSuspenseQueryOptions(accountId));

	return (
		<ul>
			{data
				.sort((i) => (i.is_pinned ? -1 : 1))
				.map((chat) => (
					<ChatItem key={chat.id} chat={chat} />
				))}
		</ul>
	);
}

interface ChatItemProps extends React.HTMLAttributes<HTMLLIElement> {
	chat: ChatType;
}

function ChatItem({ chat, className, ...props }: ChatItemProps) {
	const { accountId } = Route.useParams();

	const { ref: itemRef, inViewport } = useInViewport();

	const { data: last_message } = useQuery({
		...LastMessageQueryOptions(accountId, {
			chat,
		}),
		enabled: inViewport,
	});

	return (
		<li key={chat.id} ref={itemRef} {...props}>
			<Link
				to="/$accountId/chat/$chatId"
				params={{ accountId, chatId: chat.id }}
				className={cn(
					"box-content p-2.5 h-11 flex items-center gap-4 hover:bg-black/5 [&.active]:bg-black/5",
					className,
				)}
			>
				{chat.photo ? (
					<div
						className={cn(
							"shrink-0 w-12 h-12 clothoid-corner-2",
							chat.type === "chatroom"
								? "relative after:content-[''] after:absolute after:inset-0 after:rounded-lg after:border-2 after:border-[#DDDFE0]"
								: "",
						)}
					>
						<Image
							width={48}
							height={48}
							className={"w-full h-full bg-[#DDDFE0]"}
							src={chat.photo}
						/>
					</div>
				) : (
					<div className={"shrink-0 w-12 h-12 rounded-lg bg-neutral-300"} />
				)}

				<div className="grow flex flex-col items-stretch">
					<div className="flex gap-2">
						<h4 className={"grow font-medium break-all line-clamp-1"}>
							{chat.title}
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
								showUsername={chat.type === "chatroom"}
								className={""}
							/>
						)}
					</div>
				</div>
			</Link>
		</li>
	);
}
