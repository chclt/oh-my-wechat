import Image from "@/components/image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { MessageProp } from "@/components/message/message.tsx";
import type { StickerMessageType } from "@/schema";
import { cn } from "@/lib/utils.ts";

type StickerMessageProps = MessageProp<StickerMessageType>;

export interface StickerMessageEntity {
	msg: {
		emoji: {
			"@_fromusername": string;
			"@_tousername": string;
			"@_type": string;
			"@_idbuffer": string;
			"@_md5": string;
			"@_len": string;
			"@_productid": string;
			"@_androidmd5": string;
			"@_androidlen": string;

			"@_s60v3md5": string;
			"@_s60v3len": string;
			"@_s60v5md5": string;
			"@_s60v5len": string;

			"@_cdnurl": string;
			"@_designerid": string;
			"@_thumburl": string;
			"@_encrypturl": string;
			"@_aeskey": string;

			"@_externurl": string;
			"@_externmd5": string;

			"@_width": string;
			"@_height": string;

			"@_tpurl": string;
			"@_tpauthkey": string;
			"@_attachedtext": string;
			"@_attachedtextcolor": string;
			"@_lensid": string;
			"@_emojiattr": string;
			"@_linkid": string;
			"@_desc": string;
		};

		gameext: {
			"@_type": string;
			"@_content": string;
		};
	};
}

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
