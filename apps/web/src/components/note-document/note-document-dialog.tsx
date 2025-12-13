import dialogClasses from "@/components/ui/dialog.module.css";
import scrollAreaClasses from "@/components/ui/scroll-area.module.css";
import { cn } from "@/lib/utils";
import { Dialog, ScrollArea } from "@base-ui/react";
import { useRef } from "react";
export default function NoteDocumentDialogContent({
	children,
}: {
	children: React.ReactNode;
}) {
	const noteDocumentDialogPopupRef = useRef<HTMLDivElement>(null);

	return (
		<Dialog.Portal>
			<Dialog.Backdrop 
				className={cn(
					dialogClasses.Backdrop,
					"backdrop-blur-[2px]",
					"transition-[backdrop-filter,opacity]",
					"ease-[var(--ease-out-fast)] duration-[600ms]",
					"data-[starting-style]:backdrop-blur-0",
					"data-[ending-style]:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] data-[ending-style]:duration-[200ms]",
					"data-[ending-style]:backdrop-blur-0",
				)}
			/>
			<Dialog.Viewport className={dialogClasses.Viewport}>
				<ScrollArea.Root
					className={scrollAreaClasses.Viewport}
					style={{ position: undefined }}
				>
					<ScrollArea.Viewport className={scrollAreaClasses.Viewport}>
						<ScrollArea.Content
							className={cn(scrollAreaClasses.Content, "overflow-hidden")}
						>
							<Dialog.Popup
								ref={noteDocumentDialogPopupRef}
								initialFocus={noteDocumentDialogPopupRef}
								className={cn(
									dialogClasses.Popup,
									"relative max-w-[min(var(--container-md),calc(100%-2rem))] mx-auto my-18 overflow-hidden",
									// "shadow-[0_10px_64px_-10px_rgba(36,40,52,0.2),0_0.25px_0_1px_rgba(229,231,235,1)]",
									"ease-[cubic-bezier(0.45,1.005,0,1.005)] duration-[700ms]",
									"data-[starting-style]:opacity-100 data-[starting-style]:translate-y-[100dvh]",
									"data-[ending-style]:ease-[cubic-bezier(0.375,0.015,0.545,0.455)] data-[ending-style]:duration-[200ms]",
									"data-[ending-style]:opacity-100 data-[ending-style]:translate-y-[max(100dvh,100%)]",
								)}
							>
								<div className="z-10 sticky top-0 p-4 bg-background">
									<Dialog.Title className={dialogClasses.Title}>
										笔记
									</Dialog.Title>
								</div>

								{children}
							</Dialog.Popup>
						</ScrollArea.Content>
					</ScrollArea.Viewport>
					<ScrollArea.Scrollbar
						className={cn(scrollAreaClasses.Scrollbar, "absolute rounded-xl")}
					>
						<ScrollArea.Thumb className={scrollAreaClasses.Thumb} />
					</ScrollArea.Scrollbar>
				</ScrollArea.Root>
			</Dialog.Viewport>
		</Dialog.Portal>
	);
}
