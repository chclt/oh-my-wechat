import { useDisclosure } from "@mantine/hooks";
import { ChevronLeftIcon } from "lucide-react";
import { type AnimationEvent, useId, useState } from "react";
import { useLocation } from "wouter";
import { Avatar } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	WouterPageContentClassName,
	WouterPageOverlayClassName,
} from "@/components/wouter/page";
import { cn } from "@/lib/utils";
import ContactAlphabetList, {
	AlphabetNavigator,
} from "./contact-alphabet-list";
import useContactAlphabetList from "./use-contact-alphabet-list";
import { ContactListContctGroupItem } from "./use-contact-list";

export default function ContactGroupList({
	accountId,
	contactGroup,
}: {
	accountId: string;
	contactGroup: ContactListContctGroupItem;
}) {
	const [, navigate] = useLocation();
	const [isOpen, { close }] = useDisclosure(true);
	const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
		if (event.target === event.currentTarget && !isOpen) {
			navigate("/", { replace: true });
		}
	};

	const [scrollTarget, setScrollTarget] = useState<HTMLDivElement>();

	const reactId = useId();

	const contactAlphabetList = useContactAlphabetList(contactGroup.value);

	return (
		<>
			<div
				id={reactId}
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
					ref={(node) => {
						if (node) {
							setScrollTarget(node);
						}
					}}
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

						<Avatar src={contactGroup.photo} className="shrink-0" />

						<div className="ms-3 font-semibold">
							<span className="font-medium">{contactGroup.title}</span>
						</div>
					</header>

					<ContactAlphabetList
						accountId={accountId}
						contactAlphabetList={contactAlphabetList}
					/>
				</ScrollArea>

				{scrollTarget && (
					<AlphabetNavigator
						scrollSpySelector={`#${reactId} + [data-alphabet="root"] [data-alphabet]`}
						scrollTarget={scrollTarget}
						className="z-20 absolute my-auto top-0 bottom-0 end-1.5"
					/>
				)}
			</section>
		</>
	);
}
