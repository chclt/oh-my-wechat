import { useDisclosure } from "@mantine/hooks";
import { ChevronLeftIcon } from "lucide-react";
import type { AnimationEvent } from "react";
import { useLocation } from "wouter";
import { Avatar } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	WouterPageContentClassName,
	WouterPageOverlayClassName,
} from "@/components/wouter/page";
import { cn } from "@/lib/utils.ts";
import ChatListItem from "./chat-item";
import { ChatListChatGroupItem } from "./use-chat-list";

export default function ChatGroupList({
	chatListItem,
}: {
	chatListItem: ChatListChatGroupItem;
}) {
	const [, navigate] = useLocation();
	const [isOpen, { close }] = useDisclosure(true);
	const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
		if (event.target === event.currentTarget && !isOpen) {
			navigate("/", { replace: true });
		}
	};

	return (
		<>
			<div
				data-state={isOpen ? "open" : "closed"}
				aria-hidden={true}
				className={cn(
					"absolute inset-0 bg-background",
					WouterPageOverlayClassName,
				)}
			/>
			<section
				data-state={isOpen ? "open" : "closed"}
				className={cn(
					"absolute inset-0 bg-background",
					WouterPageContentClassName,
				)}
				onAnimationEnd={handleAnimationEnd}
			>
				<ScrollArea
					// ScrollArea.Content 默认有 min-width: fit-content 的样式，本场景下未发现明显作用
					classNames={{ content: "min-w-0!" }}
					className={cn(
						"size-full",
						"[&_[data-slot='scroll-area-scrollbar']]:z-30 [&_[data-slot='scroll-area-scrollbar']]:top-16!",
					)}
				>
					<header className="sticky z-30 top-0 h-16 px-3 grid grid-cols-[auto_auto_minmax(0,1fr)] items-center texture border-b border-muted">
						<Button
							aria-label="返回聊天列表"
							size="icon"
							variant="ghost"
							className="mr-3 opacity-80"
							onClick={() => {
								close();
							}}
						>
							<ChevronLeftIcon />
						</Button>

						<Avatar
							src={chatListItem.photo}
							className="w-12 h-12 clothoid-corner-2"
						/>

						<div className="ms-3 font-semibold">
							<span className="font-medium">{chatListItem.title}</span>
						</div>
					</header>

					<ul>
						{chatListItem.value.map((chat) => (
							<ChatListItem key={chat.id} chatListItem={chat} />
						))}
					</ul>
				</ScrollArea>
			</section>
		</>
	);
}
