import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import { StickerOpenMessageEntity } from "@/schema/open-message.ts";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";

type StickerMessageProps = OpenMessageProps<StickerOpenMessageEntity>;

export default function StickerMessage({
	message,
	variant = "default",
	...props
}: StickerMessageProps) {
	if (variant === "default") {
		return <StickerMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <StickerMessageAbstract message={message} {...props} />;
	}
}

function StickerMessageDefault({
	message,
	...props
}: Omit<StickerMessageProps, "variant">) {
	const { ref: imageRef, inViewport } = useInViewport();

	const { data: image } = useQuery({
		...MessageImageQueryOptions({
			account: { id: "" },
			chat: { id: message.chat_id },
			message,
			domain: "opendata",
		}),
		enabled: inViewport,
	});
	return (
		<div {...props}>
			<AutoResolutionFallbackImage
				ref={imageRef}
				image={image}
				className="max-w-32"
			/>
		</div>
	);
}

function StickerMessageAbstract({
	message,
	...props
}: Omit<StickerMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[表情]
		</MessageInlineWrapper>
	);
}
