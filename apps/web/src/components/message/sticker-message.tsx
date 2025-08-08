import Image from "@/components/image.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import type { StickerMessageType } from "@/schema";

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
	if (variant === "default")
		return (
			<div className="" {...props}>
				<Image
					{...(message.message_entity.msg.emoji["@_width"]
						? {
								width:
									Number.parseInt(message.message_entity.msg.emoji["@_width"]) /
									2,
							}
						: {})}
					{...(message.message_entity.msg.emoji["@_height"]
						? {
								height:
									Number.parseInt(
										message.message_entity.msg.emoji["@_height"],
									) / 2,
							}
						: {})}
					src={message.message_entity.msg.emoji["@_cdnurl"]}
					alt={"表情"}
					className={"min-w-11 min-h-11 max-w-32 max-h-32"}
					style={
						{
							// width: message.message_entity.msg.emoji["@_width"],
							// height: message.message_entity.msg.emoji["@_height"],
						}
					}
				/>
			</div>
		);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[表情]
		</MessageInlineWrapper>
	);
}
