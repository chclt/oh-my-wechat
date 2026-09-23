import { useDisclosure } from "@mantine/hooks";
import { MessageTypeEnum } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon } from "lucide-react";
import type { AnimationEvent } from "react";
import { useLocation } from "wouter";
import Image from "@/components/image.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import {
	WouterPageContentClassName,
	WouterPageOverlayClassName,
} from "@/components/wouter/page";
import { GreetingMessageListQueryOptions } from "@/lib/fetchers/message.ts";
import { cn } from "@/lib/utils.ts";
import GreetingMessageItem from "@/routes/$accountId/contact/-components/contact-list/greeting-message-item.tsx";
import { ContactListContctItem } from "@/routes/$accountId/contact/-components/contact-list/use-contact-list.ts";

export default function GreetingMessageList({
	accountId,
	contactItem,
}: {
	accountId: string;
	contactItem: Pick<ContactListContctItem, "photo" | "title">;
}) {
	const [, navigate] = useLocation();
	const [isOpen, { close }] = useDisclosure(true);
	const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
		if (event.target === event.currentTarget && !isOpen) {
			navigate("/", { replace: true });
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
					WouterPageOverlayClassName,
				)}
			/>
			<section
				data-alphabet="root"
				data-state={isOpen ? "open" : "closed"}
				className={cn(
					"absolute inset-0 bg-background",
					WouterPageContentClassName,
				)}
				onAnimationEnd={handleAnimationEnd}
			>
				<ScrollArea
					className={cn(
						"size-full",
						"[&_[data-slot='scroll-area-scrollbar']]:z-30 [&_[data-slot='scroll-area-scrollbar']]:top-16!",
					)}
				>
					<header className="sticky z-30 top-0 h-16 px-5 ps-2.5 flex items-center texture border-b border-muted">
						<Button
							aria-label="返回通讯录"
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
