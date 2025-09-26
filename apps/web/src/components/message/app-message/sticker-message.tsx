import LocalImage from "@/components/local-image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import type { AppMessageTypeEnum } from "@/schema";

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
	const chat = message.chat;
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
	const chat = message.chat;

	return (
		<div {...props}>
			<LocalImage
				chat={chat!}
				message={message}
				size="origin"
				domain="opendata"
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
