import { Dialog } from "@base-ui/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MessageType } from "@repo/types";
import { CrossCircleSolid } from "@/components/icon.tsx";
import dialogClasses from "@/components/ui/dialog.module.css";
import { cn } from "@/lib/utils";
import { CarouselScrollViewportContext } from "./carousel-scroll-viewport-context.tsx";
import { useChatMediaCarouselContext } from "./chat-media-carousel-context.tsx";
import DetailCarousel from "./detail-carousel";
import ThumbCarousel from "./thumb-carousel";
import { useMediaCarousel } from "./use-media-carousel";

export default function ChatMediaCarouselDialog() {
	const { account, chat, isDialogOpen, setIsDialogOpen, initialMessageRef } =
		useChatMediaCarouselContext();

	return (
		<Dialog.Root
			open={isDialogOpen}
			onOpenChange={(open) => setIsDialogOpen(open)}
		>
			<Dialog.Portal>
				<Dialog.Backdrop
					className={cn(dialogClasses.Backdrop, "bg-black/90")}
				/>
				<Dialog.Viewport className={dialogClasses.Viewport}>
					<Dialog.Popup
						className={cn(
							"absolute inset-0 grid grid-cols-1 grid-rows-[1fr_min-content]",
						)}
					>
						<VisuallyHidden>
							<Dialog.Title>媒体文件浏览器</Dialog.Title>
							<Dialog.Description>媒体文件浏览器</Dialog.Description>
						</VisuallyHidden>

						{isDialogOpen && (
							<MediaCarouselDialogContent
								account={account}
								chat={chat}
								isDialogOpen={isDialogOpen}
								initialMessageRef={initialMessageRef}
							/>
						)}

						<Dialog.Close className="absolute top-4 end-4 p-4 cursor-pointer text-white/50 hover:text-white/80">
							<CrossCircleSolid className="size-8 inset-0 m-auto" />
						</Dialog.Close>
					</Dialog.Popup>
				</Dialog.Viewport>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

interface MediaCarouselDialogContentProps {
	account: { id: string };
	chat: { id: string };
	isDialogOpen: boolean;
	initialMessageRef: React.RefObject<MessageType | null>;
}

/**
 * 把 dialog 的“内容”和“开关”分成两个组件，
 * 这样每次 dialog 关闭再打开时 useMediaCarousel 会被整体重建，
 * 内部的两个 virtualizer 也跟着重建——和 “每次打开都是全新状态机” 的语义保持一致。
 *
 * TODO: 后续如果要跨打开复用 measurements 缓存，
 * 把 hook 上提到外层组件并保留 ref，再把缓存传进 useVirtualizer 的 initialMeasurementsCache。
 */
function MediaCarouselDialogContent({
	account,
	chat,
	isDialogOpen,
	initialMessageRef,
}: MediaCarouselDialogContentProps) {
	const carousel = useMediaCarousel({
		account,
		chat,
		isDialogOpen,
		initialMessage: initialMessageRef.current,
		// debug: true,
	});

	return (
		<CarouselScrollViewportContext value={carousel.scrollLockContextValue}>
			<DetailCarousel
				account={account}
				virtualizer={carousel.detail.virtualizer}
				viewportRef={carousel.detail.viewportRef}
				itemSize={carousel.detail.itemSize}
				onScroll={carousel.detail.onScroll}
				messages={carousel.messages}
				hasPreviousPage={carousel.hasPreviousPage}
				hasNextPage={carousel.hasNextPage}
			/>

			<ThumbCarousel
				account={account}
				virtualizer={carousel.thumb.virtualizer}
				viewportRef={carousel.thumb.viewportRef}
				onScroll={carousel.thumb.onScroll}
				messages={carousel.messages}
				hasPreviousPage={carousel.hasPreviousPage}
				hasNextPage={carousel.hasNextPage}
			/>
		</CarouselScrollViewportContext>
	);
}
