import type React from "react";
import TextPrettier from "@/components/text-prettier.tsx";
import type { TextMessageProps } from "./types.ts";

export function TextMessageReferenced({
	message,
	...props
}: Omit<TextMessageProps, "variant">) {
	return (
		<span className={"inline"} {...props}>
			<TextPrettier text={message.message_entity} inline />
		</span>
	);
}
