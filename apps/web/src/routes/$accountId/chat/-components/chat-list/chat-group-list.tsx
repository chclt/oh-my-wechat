import Image from "@/components/image.tsx";
import { useMiniRoute, useMiniRouter } from "@/components/mini-router";
import { Button } from "@/components/ui/button";
import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils.ts";
import { useDisclosure } from "@mantine/hooks";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { XIcon } from "lucide-react";
import ChatListItem from "./chat-item";
import { ChatListChatGroupItem } from "./use-chat-list";

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
			console.log("back");
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
					"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:ease-out",
					"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:ease-out",
					"fill-mode-forwards duration-200",
				)}
			/>
			<div
				data-state={isOpen ? "open" : "closed"}
				className={cn(
					"absolute inset-0 bg-background",
					"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-end-40 data-[state=open]:ease-out",
					"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-end-40 data-[state=closed]:ease-out",
					"fill-mode-forwards duration-200",
				)}
				onAnimationEnd={handleAnimationEnd}
			>
				<ScrollAreaPrimitive.Root
					data-slot="scroll-area"
					className={cn("relative w-full h-full")}
				>
					<ScrollAreaPrimitive.Viewport className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1">
						<header className="sticky z-30 top-0 h-16 px-3 flex items-center bg-background/80 border-b border-muted backdrop-blur-xl">
							<Button
								size="icon"
								variant="ghost"
								className="mr-3 opacity-80"
								onClick={() => {
									close();
								}}
							>
								<XIcon />
							</Button>
							<div className={cn("shrink-0 w-12 h-12 clothoid-corner-2")}>
								<Image
									width={48}
									height={48}
									className={"w-full h-full bg-[#DDDFE0]"}
									src={chatListItem.photo}
								/>
							</div>

							<div className="ms-3 font-semibold">
								<span className="font-medium">{chatListItem.title}</span>
							</div>
						</header>

						<ul>
							{chatListItem.value.map((chat) => (
								<ChatListItem key={chat.id} chatListItem={chat} />
							))}
						</ul>
					</ScrollAreaPrimitive.Viewport>
					<ScrollBar className="z-30" />
					<ScrollAreaPrimitive.Corner />
				</ScrollAreaPrimitive.Root>
			</div>
		</>
	);
}
