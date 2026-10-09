import { useRender } from "@base-ui/react/use-render";
import { textMessageVariants } from "@/components/message/text-message/libs.ts";
import TextPrettier from "@/components/text-prettier.tsx";
import { cn } from "@/lib/utils.ts";
import { ReferMessageSummary } from "./refer-message-summary";
import ReferencedMessage from "./referenced-message";
import type { ReferMessageProps } from "./types";

export interface ReferMessageDefaultProps extends ReferMessageProps {
	renderReference?: useRender.RenderProp;
}

export function ReferMessageDefault({
	message,
	renderReference,
	...props
}: ReferMessageDefaultProps) {
	// 备份中没有原消息时（如原消息发于入群前），reply_to_message 为空，改用引用自带的内容展示。
	const referencedMessage = message.reply_to_message;
	const referenceClassName = cn(
		"block mt-2 pl-1.5 pr-2.5 py-1 text-sm leading-normal text-neutral-600 border-l-2 rounded",
		[
			"bg-white/25 border-white/55",
			"bg-[rgba(222,222,222,0.3)] border-[rgba(193,193,193,0.6)]",
		][message.direction],
	);
	const reference = useRender({
		defaultTagName: "div",
		render: renderReference,
		props: {
			className: referenceClassName,
			children: referencedMessage ? (
				<ReferencedMessage message={referencedMessage} />
			) : (
				<ReferMessageSummary
					reference={message.message_entity.msg.appmsg.refermsg}
				/>
			),
		},
	});

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

			{reference}
		</div>
	);
}
