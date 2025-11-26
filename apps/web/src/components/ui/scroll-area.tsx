import { cn } from "@/lib/utils";
import { ScrollArea as ScrollAreaBase } from "@base-ui-components/react";
import type * as React from "react";
import classes from "./scroll-area.module.css";

export function ScrollArea({
	className,
	children,
	ref: viewportRef,
	...props
}: ScrollAreaBase.Root.Props & { ref?: React.Ref<HTMLDivElement> }) {
	return (
		<ScrollAreaBase.Root
			data-slot="scroll-area"
			className={cn(classes.Root, className)}
			{...props}
		>
			<ScrollAreaBase.Viewport ref={viewportRef} className={classes.Viewport}>
				<ScrollAreaBase.Content className={classes.Content}>
					{children}
				</ScrollAreaBase.Content>
			</ScrollAreaBase.Viewport>
			<ScrollAreaScrollBar />
			<ScrollAreaBase.Corner />
		</ScrollAreaBase.Root>
	);
}

export function ScrollAreaScrollBar({
	orientation = "vertical",
	className,
	...props
}: ScrollAreaBase.Scrollbar.Props) {
	return (
		<ScrollAreaBase.Scrollbar
			data-slot="scroll-area-scrollbar"
			className={cn(classes.Scrollbar, className)}
			orientation={orientation}
			{...props}
		>
			<ScrollAreaBase.Thumb
				data-slot="scroll-area-thumb"
				className={classes.Thumb}
			/>
		</ScrollAreaBase.Scrollbar>
	);
}
