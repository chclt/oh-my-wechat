import AutoResolutionFallbackImage from "@/components/auto-resolution-fallback-image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import { MessageImageQueryOptions } from "@/lib/fetchers";
import type { AppMessageTypeEnum } from "@/schema";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";

export interface StickerMessageEntity {
	type: AppMessageTypeEnum.STICKER;
	title: string;
	appattach: {
		totallen: number;
		attachid: string;
		cdnattachurl: string;
		emoticonmd5: string;
		aeskey: string;
		fileext: string;
		islargefilemsg: number;
		cdnthumburl: string;
		cdnthumbaeskey: string;
		cdnthumblength: number;
		cdnthumbwidth: number;
		cdnthumbheight: number;
		cdnthumbmd5: string;
	};
}

type StickerMessageProps = AppMessageProps<StickerMessageEntity>;

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
