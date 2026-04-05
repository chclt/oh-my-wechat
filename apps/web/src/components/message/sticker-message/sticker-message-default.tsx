import Image from "@/components/image.tsx";
import { cn } from "@/lib/utils.ts";
import type { StickerMessageProps } from "./types.ts";

export function StickerMessageDefault({
	message,
	...props
}: StickerMessageProps) {
	return (
		<div className="" {...props}>
			<Image
				src={message.message_entity.msg.emoji["@_cdnurl"]}
				alt={"表情"}
				className={cn(
					"min-w-11 min-h-11 max-w-32 max-h-32",
					"[&:not([src]),&[data-state='error']]:invisible [&:not([src]),&[data-state='error']]:relative [&:not([src]),&[data-state='error']]:size-16",
					"[&:not([src]),&[data-state='error']]:after:visible [&:not([src]),&[data-state='error']]:after:absolute [&:not([src]),&[data-state='error']]:after:inset-0 [&:not([src]),&[data-state='error']]:after:p-2 [&:not([src]),&[data-state='error']]:after:flex [&:not([src]),&[data-state='error']]:after:justify-center [&:not([src]),&[data-state='error']]:after:items-center",
					"[&:not([src]),&[data-state='error']]:after:text-center [&:not([src]),&[data-state='error']]:after:text-xs [&:not([src]),&[data-state='error']]:after:text-muted-foreground/50 [&:not([src]),&[data-state='error']]:after:content-['无法加载的表情'] [&:not([src]),&[data-state='error']]:after:bg-black/5",
				)}
				style={{
					...(message.message_entity.msg.emoji["@_width"]
						? {
								width:
									Number.parseInt(message.message_entity.msg.emoji["@_width"]) /
									2,
							}
						: {}),
					...(message.message_entity.msg.emoji["@_height"]
						? {
								height:
									Number.parseInt(
										message.message_entity.msg.emoji["@_height"],
									) / 2,
							}
						: {}),
				}}
			/>
		</div>
	);
}
