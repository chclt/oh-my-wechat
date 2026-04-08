import type React from "react";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import TextPrettier from "@/components/text-prettier.tsx";
import type { TextMessageProps } from "./types.ts";

export function TextMessageAbstract({
	message,
	...props
}: Omit<TextMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			<TextPrettier text={message.message_entity} inline formatLink={false} />
		</MessageInlineWrapper>
	);
}
