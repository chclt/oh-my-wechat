import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import { textMessageVariants } from "@/components/message/text-message.tsx";
import { cn } from "@/lib/utils.ts";
import type { AppMessageTypeEnum } from "@/schema";

export interface AppTextMessageEntity {
	type: AppMessageTypeEnum.TEXT;
	title: string;
	des: string; // eg. a link
}

type TextMessageProps = AppMessageProps<AppTextMessageEntity>;

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
