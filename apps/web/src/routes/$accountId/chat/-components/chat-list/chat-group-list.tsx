import { useMiniRoute, useMiniRouter } from "@/components/mini-router";
import {
	MiniRoutePageContentClassName,
	MiniRoutePageOverlayClassName,
} from "@/components/mini-router/utils";
import { Button } from "@/components/ui/button";
import { ScrollAreaViewport, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils.ts";
import { useDisclosure } from "@mantine/hooks";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { ChevronLeftIcon } from "lucide-react";
import ChatListItem from "./chat-item";
import { ChatListChatGroupItem } from "./use-chat-list";
import { Avatar } from "@/components/ui/avatar.tsx";

export interface ChatGroupListMiniRouteState {
	name: "chatGroupList";
	data: {
		chatListItem: ChatListChatGroupItem;
	};
}

export default function ChatGroupList() {
	const { back } = useMiniRouter();
	const {
		data: { chatListItem },
	} = useMiniRoute() as ChatGroupListMiniRouteState;

	const [isOpen, { close }] = useDisclosure(true);
	const handleAnimationEnd = () => {
		if (!isOpen) {
			back();
		}
	};

	return (
		<>
			<div
				data-state={isOpen ? "open" : "closed"}
				aria-hidden={true}
				className={cn(
					"absolute inset-0 bg-background",
					MiniRoutePageOverlayClassName,
				)}
			/>
			<section
				data-state={isOpen ? "open" : "closed"}
				className={cn(
					"absolute inset-0 bg-background",
					MiniRoutePageContentClassName,
				)}
				onAnimationEnd={handleAnimationEnd}
			>
				<ScrollAreaPrimitive.Root
					data-slot="scroll-area"
					className="relative w-full h-full"
				>
					<ScrollAreaViewport>
						<header className="sticky z-30 top-0 h-16 px-3 flex items-center bg-background/80 border-b border-muted backdrop-blur-xl">
							<Button
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
								className="shrink-0 w-12 h-12 clothoid-corner-2"
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
					</ScrollAreaViewport>
					<ScrollBar className="z-30 !top-16" />
					<ScrollAreaPrimitive.Corner />
				</ScrollAreaPrimitive.Root>
			</section>
		</>
	);
}
