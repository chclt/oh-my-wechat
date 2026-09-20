import { ScrollArea as BaseScrollArea } from "@base-ui/react";
import { MessageType, MessageTypeEnum } from "@repo/types";
import { LoaderIcon } from "@/components/icon";
import { ImageMessage, VideoMessage } from "@/components/message";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { cn } from "@/lib/utils";
import { CarouselScrollViewport } from "./carousel-scroll-viewport";
import transitionClasses from "./media-carousel-transition.module.css";
import type { CarouselView } from "./types";

interface ThumbCarouselProps {
	view: CarouselView;
	messages: MessageType[];
	hasPreviousPage: boolean;
	hasNextPage: boolean;
	onSelect: (messageKey: string) => void;
}

export default function ThumbCarousel({
	view,
	messages,
	hasPreviousPage,
	hasNextPage,
	onSelect,
}: ThumbCarouselProps) {
	"use no memo";

	const { virtualizer, viewport } = view;

	// virtualizer enabled=false 时返回空数组，无需额外 gate。
	const virtualItems = virtualizer.getVirtualItems();

	return (
		<BaseScrollArea.Root
			data-slot="scroll-area"
			className={cn(
				scrollAreaClasses.Root,
				transitionClasses.Controls,
				"size-full @container overflow-hidden",
			)}
		>
			<CarouselScrollViewport
				viewport={viewport}
				tabIndex={0}
				role="group"
				aria-label="缩略图导航"
				className={scrollAreaClasses.Viewport}
			>
				<BaseScrollArea.Content
					className={cn(
						scrollAreaClasses.Content,
						"h-(--media-thumb-size) relative",
					)}
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
							<button
								type="button"
								tabIndex={-1}
								key={virtualItem.key}
								data-message-uri={virtualItem.key}
								onClick={() => onSelect(String(virtualItem.key))}
								aria-label={`查看${message.type === MessageTypeEnum.VIDEO ? "视频" : "图片"}，${new Date(message.date * 1000).toLocaleString()}`}
								className="absolute inset-y-0 size-(--media-thumb-size) p-2 snap-normal snap-center cursor-pointer rounded focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
								style={{
									left: 0,
									transform: `translateX(${virtualItem.start}px)`,
								}}
							>
								{message.type === MessageTypeEnum.IMAGE ? (
									<ImageMessage.Plain
										message={message}
										sizes={["thumbnail", "regular"]}
										alt=""
										className="size-full object-cover rounded"
									/>
								) : message.type === MessageTypeEnum.VIDEO ? (
									<VideoMessage.PlainCover
										message={message}
										alt=""
										className="size-full object-cover rounded"
									/>
								) : (
									<div className="size-(--media-thumb-size)" />
								)}
							</button>
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
