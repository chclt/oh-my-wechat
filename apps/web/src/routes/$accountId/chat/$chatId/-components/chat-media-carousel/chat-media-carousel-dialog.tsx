import { Dialog } from "@base-ui/react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRef } from "react";
import { CrossCircleSolid } from "@/components/icon.tsx";
import dialogClasses from "@/components/ui/dialog.module.css";
import { useViewTransition } from "@/components/view-transition";
import { cn } from "@/lib/utils";
import { useChatMediaCarouselContext } from "./chat-media-carousel-context.tsx";
import MediaCarouselDialogContent from "./media-carousel-dialog-content";
import { mediaCarouselLayout } from "./media-carousel-layout";
import transitionClasses from "./media-carousel-transition.module.css";

export default function ChatMediaCarouselDialog() {
	const detailRef = useRef<HTMLDivElement>(null);
	const { status } = useViewTransition();
	const {
		account,
		chat,
		initialMessageAnchor,
		sessionKey,
		isOpen,
		transitionDisabled,
		onOpenChange,
	} = useChatMediaCarouselContext();

	// Keep Dialog.Root around the carousel popup only, not the message list.
	// Base UI 1.8 treats any descendant Dialog as nested even when this one is
	// closed, and omits its backdrop by default.
	return (
		<Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
			<Dialog.Portal keepMounted>
				<Dialog.Backdrop
					hidden={false}
					data-dialog-fade={transitionDisabled ? "" : undefined}
					className={cn(
						dialogClasses.Backdrop,
						transitionClasses.Backdrop,
						"bg-black/90",
					)}
				/>
				<Dialog.Viewport
					hidden={false}
					inert={!isOpen}
					aria-hidden={!isOpen || undefined}
					className={dialogClasses.Viewport}
				>
					<Dialog.Popup
						data-dialog-fade={transitionDisabled ? "" : undefined}
						initialFocus={detailRef}
						style={mediaCarouselLayout}
						className={cn(transitionClasses.Popup, "absolute inset-0")}
						render={(popupProps, { open }) => (
							<div {...popupProps} hidden={false}>
								<VisuallyHidden>
									<Dialog.Title>媒体文件浏览器</Dialog.Title>
									<Dialog.Description>媒体文件浏览器</Dialog.Description>
								</VisuallyHidden>

								{initialMessageAnchor &&
									// Base UI keeps hidden=false through the whole close; open and
									// transitionStatus update separately and can leave a phase gap.
									(open || !popupProps.hidden || status !== "idle") && (
										<MediaCarouselDialogContent
											detailRef={detailRef}
											account={account}
											chat={chat}
											key={sessionKey}
											initialMessageAnchor={initialMessageAnchor}
										/>
									)}

								<Dialog.Close
									aria-label="关闭媒体浏览器"
									className={cn(
										transitionClasses.Controls,
										"absolute top-4 end-4 p-4 cursor-pointer text-white/50 hover:text-white/80",
									)}
								>
									<CrossCircleSolid className="size-8 inset-0 m-auto" />
								</Dialog.Close>
							</div>
						)}
					/>
				</Dialog.Viewport>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
