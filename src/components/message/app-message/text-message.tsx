import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import { textMessageVariants } from "@/components/message/text-message.tsx";
import type { AppMessageTypeEnum } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

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
		return (
			<div
				className={cn(
					textMessageVariants({
						variant,
						direction: message.direction,
					}),
				)}
				{...props}
			>
				{message.message_entity.msg.appmsg.title}
			</div>
		);
	}

	return (
		<MessageInlineWrapper message={message} {...props}>
			{message.message_entity.msg.appmsg.title}
		</MessageInlineWrapper>
	);
}
