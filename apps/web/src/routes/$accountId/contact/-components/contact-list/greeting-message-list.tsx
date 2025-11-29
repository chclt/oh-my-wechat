import Image from "@/components/image.tsx";
import { useMiniRoute, useMiniRouter } from "@/components/mini-router";
import {
	MiniRoutePageContentClassName,
	MiniRoutePageOverlayClassName,
} from "@/components/mini-router/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import { GreetingMessageListQueryOptions } from "@/lib/fetchers/message.ts";
import { cn } from "@/lib/utils.ts";
import GreetingMessageItem from "@/routes/$accountId/contact/-components/contact-list/greeting-message-item.tsx";
import { ContactListContctItem } from "@/routes/$accountId/contact/-components/contact-list/use-contact-list.ts";
import { MessageTypeEnum } from "@/schema";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon } from "lucide-react";

export interface GreetingMessageListMiniRouteState {
	name: "greetingMessageList";
	data: {
		contactItem: Pick<ContactListContctItem, "photo" | "title">;
		accountId: string;
	};
}

export default function GreetingMessageList() {
	const { back } = useMiniRouter();
	const {
		data: { contactItem, accountId },
	} = useMiniRoute() as GreetingMessageListMiniRouteState;

	const [isOpen, { close }] = useDisclosure(true);
	const handleAnimationEnd = () => {
		if (!isOpen) {
			back();
		}
	};

	const { data: greetingMessageList, isLoading } = useQuery(
		GreetingMessageListQueryOptions({
			account: { id: accountId },
		}),
	);

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
				data-alphabet="root"
				data-state={isOpen ? "open" : "closed"}
				className={cn(
					"absolute inset-0 bg-background",
					MiniRoutePageContentClassName,
				)}
				onAnimationEnd={handleAnimationEnd}
			>
				<ScrollArea
					className={cn(
						"size-full",
						"[&_[data-slot='scroll-area-scrollbar']]:z-30 [&_[data-slot='scroll-area-scrollbar']]:top-16!",
					)}
				>
					<header className="sticky z-30 top-0 h-16 px-5 ps-2.5 flex items-center bg-background/80 border-b border-muted backdrop-blur-xl">
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
						<div className="size-11 flex items-center justify-center text-[#FF970A] bg-background clothoid-corner-[18.18%] shrink-0">
							<Image
								src={contactItem.photo}
								alt={contactItem.title}
								className="size-full object-cover"
							/>
						</div>
						<div className="ms-3 font-semibold">
							<span className="font-medium">{contactItem.title}</span>
						</div>
					</header>

					<ul>
						{greetingMessageList?.map((message) => {
							if (message.type === MessageTypeEnum.VERITY) {
								return (
									<GreetingMessageItem
										key={`${message.id}|${message.local_id}`}
										message={message}
										className={cn(
											"relative border-b border-transparent",
											"after:absolute after:left-[4.75rem] after:right-0 after:bottom-0 after:border-b after:border-muted",
										)}
									/>
								);
							} else {
								console.error(
									"Unsupported message type in greeting messages:",
									message,
								);
							}
						})}
					</ul>
				</ScrollArea>
			</section>
		</>
	);
}
