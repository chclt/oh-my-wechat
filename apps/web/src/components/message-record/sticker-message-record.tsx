import type { StickerMessageRecordType } from "@repo/types";
import type React from "react";
import Image from "@/components/image.tsx";
import { getStickerImageDimensions } from "@/components/message/sticker-message/libs.ts";

interface StickerRecordProps extends React.HTMLAttributes<HTMLDivElement> {
	record: StickerMessageRecordType;
	variant?: string;
}

export default function StickerMessageRecord({
	record,
	variant = "default",
	...props
}: StickerRecordProps) {
	if (variant !== "default") return <span {...props}>[表情]</span>;

	const sticker = record.emojiitem;
	const dimensions = getStickerImageDimensions({
		"@_width": sticker.uiemoticonwidth?.toString(),
		"@_height": sticker.uiemoticonheight?.toString(),
	});

	return (
		<div {...props}>
			<Image
				src={sticker.cdnurlstring}
				alt="表情"
				width={dimensions?.width}
				height={dimensions?.height}
				className="block max-w-32 max-h-32 object-contain"
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
