import Image from "@/components/image.tsx";
import { cn } from "@/lib/utils.ts";
import {
	getStickerImageDimensions,
	getStickerMessageDescription,
} from "./libs.ts";
import type { StickerMessageProps } from "./types.ts";

export function StickerMessageDefault({
	message,
	className,
	...props
}: StickerMessageProps) {
	const emoji = message.message_entity.msg.emoji;
	const encodedDescription = emoji["@_desc"];
	const description = encodedDescription
		? getStickerMessageDescription(encodedDescription)
		: undefined;
	const dimensions = getStickerImageDimensions(emoji);

	return (
		<div className={className} {...props}>
			<Image
				src={emoji["@_cdnurl"]}
				alt={description ? `表情：${description}` : "表情"}
				title={description}
				width={dimensions?.width}
				height={dimensions?.height}
				className={cn(
					"block max-w-32 max-h-32 object-contain",
					!dimensions && "min-w-11 min-h-11",
					"[&:not([src]),&[data-state='error']]:invisible [&:not([src]),&[data-state='error']]:relative [&:not([src]),&[data-state='error']]:size-16",
					"[&:not([src]),&[data-state='error']]:after:visible [&:not([src]),&[data-state='error']]:after:absolute [&:not([src]),&[data-state='error']]:after:inset-0 [&:not([src]),&[data-state='error']]:after:p-2 [&:not([src]),&[data-state='error']]:after:flex [&:not([src]),&[data-state='error']]:after:justify-center [&:not([src]),&[data-state='error']]:after:items-center",
					"[&:not([src]),&[data-state='error']]:after:text-center [&:not([src]),&[data-state='error']]:after:text-xs [&:not([src]),&[data-state='error']]:after:text-muted-foreground/50 [&:not([src]),&[data-state='error']]:after:content-['无法加载的表情'] [&:not([src]),&[data-state='error']]:after:bg-black/5",
				)}
				style={
					dimensions && {
						width: dimensions.displayWidth,
						height: dimensions.displayHeight,
					}
				}
			/>
		</div>
	);
}
