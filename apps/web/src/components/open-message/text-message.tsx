import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { textMessageVariants } from "@/components/message/text-message.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import { cn } from "@/lib/utils.ts";
import { TextOpenMessageEntity } from "@/schema/open-message.ts";

type TextMessageProps = OpenMessageProps<TextOpenMessageEntity>;

export default function TextMessage({
	message,
	variant = "default",
	...props
}: TextMessageProps) {
	if (variant === "default") {
		return <TextMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <TextMessageAbstract message={message} {...props} />;
	}
}

function TextMessageDefault({
	message,
	...props
}: Omit<TextMessageProps, "variant">) {
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
			{message.message_entity.msg.appmsg.title}
		</div>
	);
}

function TextMessageAbstract({
	message,
	...props
}: Omit<TextMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			{message.message_entity.msg.appmsg.title}
		</MessageInlineWrapper>
	);
}
