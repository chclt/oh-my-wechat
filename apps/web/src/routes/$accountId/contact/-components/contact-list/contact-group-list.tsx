import Image from "@/components/image";
import { useMiniRoute, useMiniRouter } from "@/components/mini-router";
import { Button } from "@/components/ui/button";
import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDisclosure } from "@mantine/hooks";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
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
					"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:ease-out",
					"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:ease-out",
					"fill-mode-forwards duration-200",
				)}
			/>
			<div
				data-alphabet="root"
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
					<ScrollAreaPrimitive.Viewport
						ref={(node) => {
							if (node) {
								setScrollTarget(node);
							}
						}}
						className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
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
									src={contctGroup.photo}
									alt={contctGroup.title}
									className="size-full object-cover"
								/>
								{/* <ContactIconFill className="size-8" /> */}
							</div>
							<div className="ms-3 font-semibold">
								<span className="font-medium">{contctGroup.title}</span>
							</div>
						</header>

						<ContactAlphabetList
							accountId={accountId}
							contactAlphabetList={contactAlphabetList}
						/>
					</ScrollAreaPrimitive.Viewport>
					<ScrollBar className="z-30" />
					<ScrollAreaPrimitive.Corner />
				</ScrollAreaPrimitive.Root>

				{scrollTarget && (
					<AlphabetNavigator
						scrollSpySelector={`#${reactId} + [data-alphabet="root"] [data-alphabet]`}
						scrollTarget={scrollTarget}
						className="z-20 absolute my-auto top-0 bottom-0 end-1.5"
					/>
				)}
			</div>
		</>
	);
}
