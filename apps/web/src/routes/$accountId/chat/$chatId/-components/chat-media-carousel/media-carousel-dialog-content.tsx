import type { Ref } from "react";
import { LoaderIcon } from "@/components/icon.tsx";
import { cn } from "@/lib/utils";
import { useChatMediaCarouselContext } from "./chat-media-carousel-context";
import DetailCarousel from "./detail-carousel";
import transitionClasses from "./media-carousel-transition.module.css";
import ThumbCarousel from "./thumb-carousel";
import type { CarouselMessageAnchor } from "./types";
import { useMediaCarousel } from "./use-media-carousel";

interface MediaCarouselDialogContentProps {
	detailRef: Ref<HTMLDivElement>;
	account: { id: string };
	chat: { id: string };
	initialMessageAnchor: CarouselMessageAnchor;
}

// Retain a browsing session through the closing transition. Releasing its media
// or opening a different message disposes its virtualizers and controller together.
export default function MediaCarouselDialogContent(
	props: MediaCarouselDialogContentProps,
) {
	const { onCurrentKeyChange, carouselRef } = useChatMediaCarouselContext();
	const carousel = useMediaCarousel(
		{ ...props, onCurrentKeyChange },
		carouselRef,
	);
	return (
		<>
			<DetailCarousel
				ref={props.detailRef}
				view={carousel.detail}
				activeKey={carousel.currentKey}
				messages={carousel.messages}
				hasPreviousPage={carousel.hasPreviousPage}
				hasNextPage={carousel.hasNextPage}
				onPrevious={carousel.previous}
				onNext={carousel.next}
			/>
			<div className="absolute inset-x-0 bottom-0 z-10 h-(--media-thumb-size)">
				<ThumbCarousel
					view={carousel.thumb}
					messages={carousel.messages}
					hasPreviousPage={carousel.hasPreviousPage}
					hasNextPage={carousel.hasNextPage}
					onSelect={carousel.select}
				/>
			</div>
			{carousel.error ? (
				<div
					role="alert"
					className={cn(
						transitionClasses.Controls,
						"absolute top-6 inset-x-24 flex items-center justify-center gap-3 text-sm text-white",
					)}
				>
					<span>{carousel.error}</span>
					<button
						type="button"
						onClick={carousel.retry}
						disabled={carousel.isFetching}
						className="underline cursor-pointer disabled:opacity-50"
					>
						重试
					</button>
				</div>
			) : carousel.isLoading ? (
				<div
					role="status"
					className={cn(
						transitionClasses.Controls,
						"absolute inset-0 m-auto size-8 text-white pointer-events-none",
					)}
				>
					<LoaderIcon className="size-8 animate-spin" />
					<span className="sr-only">正在加载媒体</span>
				</div>
			) : null}
		</>
	);
}
