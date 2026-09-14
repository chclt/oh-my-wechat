import { Dialog } from "@base-ui/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MessageType } from "@repo/types";
import { CrossCircleSolid, LoaderIcon } from "@/components/icon.tsx";
import dialogClasses from "@/components/ui/dialog.module.css";
import { cn } from "@/lib/utils";
import { useChatMediaCarouselContext } from "./chat-media-carousel-context.tsx";
import DetailCarousel from "./detail-carousel";
import ThumbCarousel from "./thumb-carousel";
import { useMediaCarousel } from "./use-media-carousel";
import { createMessageURI } from "./utils";

export default function ChatMediaCarouselDialog() {
	const { account, chat, initialMessage, closeChatMediaCarousel } =
		useChatMediaCarouselContext();

	return (
		<Dialog.Root
			open={initialMessage !== null}
			onOpenChange={(open) => {
				if (!open) closeChatMediaCarousel();
			}}
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

						{initialMessage && (
							<MediaCarouselDialogContent
								account={account}
								chat={chat}
								key={createMessageURI({ account, message: initialMessage })}
								initialMessage={initialMessage}
							/>
						)}

						<Dialog.Close
							aria-label="关闭媒体浏览器"
							className="absolute top-4 end-4 p-4 cursor-pointer text-white/50 hover:text-white/80"
						>
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
	initialMessage: MessageType;
}

// Mounting starts one browsing session; closing or opening a different message
// disposes its virtualizers and position controller together.
function MediaCarouselDialogContent(props: MediaCarouselDialogContentProps) {
	const carousel = useMediaCarousel(props);
	return (
		<>
			<DetailCarousel
				view={carousel.detail}
				messages={carousel.messages}
				hasPreviousPage={carousel.hasPreviousPage}
				hasNextPage={carousel.hasNextPage}
				onPrevious={carousel.previous}
				onNext={carousel.next}
			/>
			<ThumbCarousel
				view={carousel.thumb}
				messages={carousel.messages}
				hasPreviousPage={carousel.hasPreviousPage}
				hasNextPage={carousel.hasNextPage}
			/>
			{carousel.error ? (
				<div
					role="alert"
					className="absolute top-6 inset-x-24 flex items-center justify-center gap-3 text-sm text-white"
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
					className="absolute inset-0 m-auto size-8 text-white pointer-events-none"
				>
					<LoaderIcon className="size-8 animate-spin" />
					<span className="sr-only">正在加载媒体</span>
				</div>
			) : null}
		</>
	);
}
