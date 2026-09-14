import { Button, ScrollArea as BaseScrollArea } from "@base-ui/react";
import { MessageType, MessageTypeEnum } from "@repo/types";
import {
	ChevronLeftCircleSolid,
	ChevronRightCircleSolid,
	LoaderIcon,
} from "@/components/icon";
import { ImageMessage, VideoMessage } from "@/components/message";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { cn } from "@/lib/utils";
import { CarouselScrollViewport } from "./carousel-scroll-viewport";
import type { CarouselView } from "./types";

interface DetailCarouselProps {
	view: CarouselView;
	messages: MessageType[];
	hasPreviousPage: boolean;
	hasNextPage: boolean;
	onPrevious: () => void;
	onNext: () => void;
}

export default function DetailCarousel({
	view,
	messages,
	hasPreviousPage,
	hasNextPage,
	onPrevious,
	onNext,
}: DetailCarouselProps) {
	"use no memo";

	const { virtualizer, viewport } = view;

	// virtualizer enabled=false 时返回空数组，无需额外 gate。
	const virtualItems = virtualizer.getVirtualItems();

	return (
		<BaseScrollArea.Root
			data-slot="scroll-area"
			className={cn(scrollAreaClasses.Root, "relative overflow-hidden")}
		>
			<CarouselScrollViewport
				viewport={viewport}
				className={cn(scrollAreaClasses.Viewport, "pb-2")}
			>
				<BaseScrollArea.Content
					className={cn(
						scrollAreaClasses.Content,
						"h-full relative",
						"[&_.carouselWrapper]:-translate-x-[calc((var(--carousel-scroll-start)-var(--carousel-start))/var(--carousel-size)*3rem)]",
						"[&_.carouselContent]:-translate-x-[calc((var(--carousel-scroll-start)-var(--carousel-start))/var(--carousel-size)*-3rem)]",
					)}
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
								data-message-uri={virtualItem.key}
								className={cn(
									"absolute top-0 h-full px-24",
									"snap-normal snap-center",
								)}
								style={{
									left: 0,
									width: virtualItem.size,
									transform: `translateX(${virtualItem.start}px)`,
									...({
										"--carousel-start": `${virtualItem.start}px`,
										"--carousel-end": `${virtualItem.end}px`,
										"--carousel-size": `${virtualItem.size}px`,
									} as React.CSSProperties),
								}}
							>
								<div
									className={cn(
										"carouselWrapper",
										"relative overflow-hidden h-full",
									)}
								>
									{message.type === MessageTypeEnum.IMAGE ? (
										<ImageMessage.Plain
											message={message}
											sizes={["hd", "regular", "thumbnail"]}
											className={cn(
												"carouselContent",
												"absolute inset-0 m-auto max-w-full max-h-full",
											)}
										/>
									) : message.type === MessageTypeEnum.VIDEO ? (
										<VideoMessage.Plain
											message={message}
											muted
											className={cn(
												"carouselContent",
												"absolute inset-0 m-auto max-w-full max-h-full",
											)}
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
				onClick={onPrevious}
				aria-label="上一张"
				className="absolute start-0 inset-y-0 my-auto w-24 h-full cursor-pointer text-white/50 hover:text-white/80"
			>
				<ChevronLeftCircleSolid className="size-8 absolute inset-0 m-auto" />
			</Button>
			<Button
				onClick={onNext}
				aria-label="下一张"
				className="absolute end-0 inset-y-0 my-auto w-24 h-full cursor-pointer text-white/50 hover:text-white/80"
			>
				<ChevronRightCircleSolid className="size-8 absolute inset-0 m-auto" />
			</Button>
		</BaseScrollArea.Root>
	);
}
