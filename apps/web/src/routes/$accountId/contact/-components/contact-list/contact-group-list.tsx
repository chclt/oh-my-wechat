import { useMiniRoute, useMiniRouter } from "@/components/mini-router";
import {
	MiniRoutePageContentClassName,
	MiniRoutePageOverlayClassName,
} from "@/components/mini-router/utils";
import { Avatar } from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDisclosure } from "@mantine/hooks";
import { ChevronLeftIcon } from "lucide-react";
import { useId, useState } from "react";
import ContactAlphabetList, {
	AlphabetNavigator,
} from "./contact-alphabet-list";
import useContactAlphabetList from "./use-contact-alphabet-list";
import { ContactListContctGroupItem } from "./use-contact-list";

export interface ContactGroupListMiniRouteState {
	name: "contactGroupList";
	data: {
		contctGroup: ContactListContctGroupItem;
		accountId: string;
	};
}

export default function ContactGroupList() {
	const { back } = useMiniRouter();
	const {
		data: { contctGroup, accountId },
	} = useMiniRoute() as ContactGroupListMiniRouteState;

	const [isOpen, { close }] = useDisclosure(true);
	const handleAnimationEnd = () => {
		if (!isOpen) {
			back();
		}
	};

	const [scrollTarget, setScrollTarget] = useState<HTMLDivElement>();

	const reactId = useId();

	const contactAlphabetList = useContactAlphabetList(contctGroup.value);

	return (
		<>
			<div
				id={reactId}
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

						<Avatar src={contctGroup.photo} className="shrink-0" />

						<div className="ms-3 font-semibold">
							<span className="font-medium">{contctGroup.title}</span>
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
