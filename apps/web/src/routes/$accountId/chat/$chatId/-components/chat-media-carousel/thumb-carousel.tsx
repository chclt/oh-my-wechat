import { ScrollArea as BaseScrollArea } from "@base-ui/react";
import { MessageType, MessageTypeEnum } from "@repo/types";
import { Virtualizer } from "@tanstack/react-virtual";
import { LoaderIcon } from "@/components/icon";
import { ImageMessage, VideoMessage } from "@/components/message";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { cn } from "@/lib/utils";
import { CarouselScrollViewport } from "./carousel-scroll-viewport";
import { createMessageURI } from "./utils";

interface ThumbCarouselProps {
	account: { id: string };
	virtualizer: Virtualizer<HTMLDivElement, Element>;
	viewportRef: (element: HTMLDivElement | null) => void;
	onScroll: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
	messages: MessageType[];
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

export default function ThumbCarousel({
	account,
	virtualizer,
	viewportRef,
	onScroll,
	messages,
	hasPreviousPage,
	hasNextPage,
}: ThumbCarouselProps) {
	"use no memo";

	// virtualizer enabled=false 时返回空数组，无需额外 gate。
	const virtualItems = virtualizer.getVirtualItems();

	return (
		<BaseScrollArea.Root
			data-slot="scroll-area"
			className={cn(scrollAreaClasses.Root, "@container overflow-hidden")}
		>
			<CarouselScrollViewport
				ref={viewportRef}
				slice="thumb"
				className={scrollAreaClasses.Viewport}
				onScroll={onScroll}
			>
				<BaseScrollArea.Content
					className={cn(scrollAreaClasses.Content, "h-24 relative")}
					style={{ width: virtualizer.getTotalSize() }}
				>
					<div
						className="absolute inset-y-0 left-0 h-full"
						style={{ width: "var(--carousel-padding-start)" }}
					>
						{hasPreviousPage && (
							<LoaderIcon className="absolute inset-y-0 my-auto end-9 text-white opacity-75 animate-spin" />
						)}
					</div>

					{virtualItems.map((virtualItem) => {
						const message = messages[virtualItem.index];
						if (!message) return null;
						return (
							<div
								key={virtualItem.key}
								ref={virtualizer.measureElement}
								data-index={virtualItem.index}
								data-message-uri={createMessageURI({ message, account })}
								className="absolute inset-y-0 size-24 p-2 snap-normal snap-center"
								style={{
									left: 0,
									transform: `translateX(${virtualItem.start}px)`,
								}}
							>
								{message.type === MessageTypeEnum.IMAGE ? (
									<ImageMessage.Plain
										message={message}
										sizes={["thumbnail", "regular"]}
										className="size-full object-cover rounded"
									/>
								) : message.type === MessageTypeEnum.VIDEO ? (
									<VideoMessage.PlainCover
										message={message}
										className="size-full object-cover rounded"
									/>
								) : (
									<div className="size-24" />
								)}
							</div>
						);
					})}

					<div
						className="absolute inset-y-0 right-0 h-full"
						style={{ width: "var(--carousel-padding-end)" }}
					>
						{hasNextPage && (
							<LoaderIcon className="absolute inset-y-0 my-auto start-9 text-white opacity-75 animate-spin" />
						)}
					</div>
				</BaseScrollArea.Content>
			</CarouselScrollViewport>
		</BaseScrollArea.Root>
	);
}
