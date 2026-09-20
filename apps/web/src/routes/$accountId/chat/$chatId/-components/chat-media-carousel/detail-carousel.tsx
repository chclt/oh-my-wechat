import { Button, ScrollArea as BaseScrollArea } from "@base-ui/react";
import { MessageType, MessageTypeEnum } from "@repo/types";
import type { Ref } from "react";
import {
	ChevronLeftCircleSolid,
	ChevronRightCircleSolid,
	LoaderIcon,
} from "@/components/icon";
import { ImageMessage, VideoMessage } from "@/components/message";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { ViewTransition } from "@/components/view-transition";
import { cn } from "@/lib/utils";
import { CarouselScrollViewport } from "./carousel-scroll-viewport";
import { DetailCarouselItem } from "./detail-carousel-item";
import DetailCarouselPreview from "./detail-carousel-preview";
import transitionClasses from "./media-carousel-transition.module.css";
import type { CarouselView } from "./types";
import { isImageReady } from "./utils";

interface DetailCarouselProps {
	activeKey: string | null;
	ref?: Ref<HTMLDivElement>;
	view: CarouselView;
	messages: MessageType[];
	hasPreviousPage: boolean;
	hasNextPage: boolean;
	onPrevious: () => void;
	onNext: () => void;
}

export default function DetailCarousel({
	activeKey,
	ref,
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
			className={cn(
				scrollAreaClasses.Root,
				"relative size-full overflow-hidden",
			)}
		>
			<CarouselScrollViewport
				ref={ref}
				viewport={viewport}
				tabIndex={0}
				role="group"
				aria-label="媒体浏览区域"
				onKeyDown={(event) => {
					// Controls inside a media item keep their own arrow-key behavior.
					if (event.target !== event.currentTarget) return;
					if (event.key === "ArrowLeft") {
						event.preventDefault();
						onPrevious();
					} else if (event.key === "ArrowRight") {
						event.preventDefault();
						onNext();
					}
				}}
				className={cn(
					scrollAreaClasses.Viewport,
					transitionClasses.DetailViewport,
					"@container",
				)}
			>
				<BaseScrollArea.Content
					className={cn(
						scrollAreaClasses.Content,
						"h-full min-w-full relative overflow-clip",
						"[&_.carouselWrapper]:-translate-x-[calc((var(--carousel-scroll-start)-var(--carousel-start))/var(--carousel-size)*3rem)]",
						"[&_.carouselContent]:-translate-x-[calc((var(--carousel-scroll-start)-var(--carousel-start))/var(--carousel-size)*-3rem)]",
					)}
					style={{ width: virtualizer.getTotalSize() }}
				>
					<div
						className="absolute top-0 bottom-(--media-bottom-inset) start-0"
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
							<DetailCarouselItem
								key={virtualItem.key}
								isActive={virtualItem.key === activeKey}
								focusTarget={virtualizer.scrollElement}
								data-message-uri={virtualItem.key}
								className={cn(
									"absolute top-0 h-full px-(--media-inline-inset) pb-(--media-bottom-inset)",
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
										<ViewTransition.Target
											targetKey={`viewer:${virtualItem.key}`}
											isReady={isImageReady}
											className={transitionClasses.Target}
											render={
												<ImageMessage.Plain
													message={message}
													sizes={["hd", "regular", "thumbnail"]}
													className={cn(
														"carouselContent",
														// Let both axes follow the intrinsic ratio when either
														// maximum constrains the image, matching the estimate.
														"absolute inset-0 m-auto w-auto h-auto max-w-full max-h-full",
													)}
												/>
											}
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
							</DetailCarouselItem>
						);
					})}

					<div
						className="absolute top-0 bottom-(--media-bottom-inset) end-0"
						style={{
							width: "var(--carousel-padding-end)",
						}}
					>
						{hasNextPage && (
							<LoaderIcon className="absolute inset-0 m-auto text-white opacity-75 animate-spin" />
						)}
					</div>
					<DetailCarouselPreview items={virtualizer.measurementsCache} />
				</BaseScrollArea.Content>
			</CarouselScrollViewport>

			<Button
				onClick={onPrevious}
				aria-label="上一张"
				className={cn(
					transitionClasses.Controls,
					"absolute start-0 top-0 bottom-(--media-thumb-size) w-(--media-inline-inset) cursor-pointer text-white/50 hover:text-white/80",
				)}
			>
				<ChevronLeftCircleSolid className="size-8 absolute inset-0 m-auto" />
			</Button>
			<Button
				onClick={onNext}
				aria-label="下一张"
				className={cn(
					transitionClasses.Controls,
					"absolute end-0 top-0 bottom-(--media-thumb-size) w-(--media-inline-inset) cursor-pointer text-white/50 hover:text-white/80",
				)}
			>
				<ChevronRightCircleSolid className="size-8 absolute inset-0 m-auto" />
			</Button>
		</BaseScrollArea.Root>
	);
}
