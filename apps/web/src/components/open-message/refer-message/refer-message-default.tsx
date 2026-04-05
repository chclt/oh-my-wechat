import Message from "@/components/message/message.tsx";
import { textMessageVariants } from "@/components/message/text-message/libs.ts";
import TextPrettier from "@/components/text-prettier.tsx";
import { cn } from "@/lib/utils.ts";
import type { ReferMessageProps } from "./types";

export function ReferMessageDefault({
	message,
	...props
}: ReferMessageProps) {
	return (
		<div
			className={cn(
				textMessageVariants({
					variant: "default",
					direction: message.direction,
				}),
			)}
			{...props}
		>
			<TextPrettier text={message.message_entity.msg.appmsg.title} />

			<div
				className={cn(
					"mt-2 pl-1.5 pr-2.5 py-1 text-sm leading-normal text-neutral-600 border-l-2 rounded",
					[
						"bg-white/25 border-white/55",
						"bg-[rgba(222,222,222,0.3)] border-[rgba(193,193,193,0.6)]",
					][message.direction],
				)}
			>
				{message.reply_to_message ? (
					<Message variant="referenced" message={message.reply_to_message} />
				) : (
					//  TODO 当引用了一个不存在的消息（比如加入群之前的消息），content 是一个 xml
					<TextPrettier
						text={message.message_entity.msg.appmsg.refermsg.content}
					/>
				)}
			</div>
		</div>
	);
}
