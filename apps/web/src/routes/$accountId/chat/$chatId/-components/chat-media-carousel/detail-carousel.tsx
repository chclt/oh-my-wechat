import { Button, ScrollArea as BaseScrollArea } from "@base-ui/react";
import { MessageType, MessageTypeEnum } from "@repo/types";
import { Virtualizer } from "@tanstack/react-virtual";
import { LoaderIcon } from "@/components/icon";
import { ImageMessage, VideoMessage } from "@/components/message";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { cn } from "@/lib/utils";
import { CarouselScrollViewport } from "./carousel-scroll-viewport";
import classes from "./index.module.css";
import { createMessageURI } from "./utils";

interface DetailCarouselProps {
	account: { id: string };
	virtualizer: Virtualizer<HTMLDivElement, Element>;
	viewportRef: (element: HTMLDivElement | null) => void;
	itemSize: number;
	onScroll: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
	messages: MessageType[];
	hasPreviousPage: boolean;
	hasNextPage: boolean;
}

export default function DetailCarousel({
	account,
	virtualizer,
	viewportRef,
	itemSize,
	onScroll,
	messages,
	hasPreviousPage,
	hasNextPage,
}: DetailCarouselProps) {
	// virtualizer enabled=false 时返回空数组，无需额外 gate。
	const virtualItems = virtualizer.getVirtualItems();

	const getCurrentIndex = () => {
		if (!virtualizer.scrollElement || !virtualizer.scrollRect) return;

		const centerOffset =
			virtualizer.scrollElement.scrollLeft + virtualizer.scrollRect.width / 2;

		return virtualizer.getVirtualItemForOffset(centerOffset)?.index;
	};

	const handleScrollToPreviousIndex = () => {
		const currentIndex = getCurrentIndex();
		if (currentIndex === undefined || currentIndex <= 0) return;

		virtualizer.scrollToIndex(currentIndex - 1, {
			align: "center",
			behavior: "instant",
		});
	};

	const handleScrollToNextIndex = () => {
		const currentIndex = getCurrentIndex();
		if (currentIndex === undefined || currentIndex >= messages.length - 1)
			return;

		virtualizer.scrollToIndex(currentIndex + 1, {
			align: "center",
			behavior: "instant",
		});
	};

	return (
		<BaseScrollArea.Root
			data-slot="scroll-area"
			className={cn(scrollAreaClasses.Root, "relative overflow-hidden")}
		>
			<CarouselScrollViewport
				ref={viewportRef}
				slice="detail"
				className={cn(
					scrollAreaClasses.Viewport,
					"pb-2",
					classes.detailScrollAreaViewport,
					classes.carouselScrollAreaViewport,
				)}
				onScroll={onScroll}
			>
				<BaseScrollArea.Content
					className={cn(scrollAreaClasses.Content, "h-full relative")}
					style={{ width: virtualizer.getTotalSize() }}
				>
					<div
						className="absolute inset-y-0 start-0 h-full"
						style={{ width: "var(--carousel-padding-start)" }}
					>
						{hasPreviousPage && (
							<LoaderIcon className="absolute inset-0 m-auto text-white opacity-75 animate-spin" />
						)}
					</div>

					{virtualItems.map((virtualItem) => {
						const message = messages[virtualItem.index];
						if (!message) return null;
						return (
							<div
								key={virtualItem.key}
								data-message-uri={createMessageURI({ message, account })}
								className={cn(
									"absolute top-0 h-full",
									"snap-normal snap-center",
									classes.carouselItemContainer,
								)}
								style={{
									left: 0,
									width: virtualItem.size,
									transform: `translateX(${virtualItem.start}px)`,
								}}
							>
								<div className={classes.carouselItem}>
									{message.type === MessageTypeEnum.IMAGE ? (
										<ImageMessage.Plain
											message={message}
											sizes={["hd", "regular", "thumbnail"]}
											className="max-w-full max-h-full"
										/>
									) : message.type === MessageTypeEnum.VIDEO ? (
										<VideoMessage.Plain
											message={message}
											muted
											className="max-w-full max-h-full"
										/>
									) : null}
								</div>
							</div>
						);
					})}

					<div
						className="absolute inset-y-0 end-0 h-full"
						style={{
							width: "var(--carousel-padding-end)",
						}}
					>
						{hasNextPage && (
							<LoaderIcon className="absolute inset-0 m-auto text-white opacity-75 animate-spin" />
						)}
					</div>
				</BaseScrollArea.Content>
			</CarouselScrollViewport>

			<Button
				onClick={handleScrollToPreviousIndex}
				className="absolute start-4 inset-y-0 my-auto size-16 bg-red-400 z-10"
			>
				上一张
			</Button>
			<Button
				onClick={handleScrollToNextIndex}
				className="absolute end-4 inset-y-0 my-auto size-16 bg-red-400 z-10"
			>
				下一张
			</Button>
		</BaseScrollArea.Root>
	);
}
