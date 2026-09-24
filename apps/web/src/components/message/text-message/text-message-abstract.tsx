import type React from "react";
import TextPrettier from "@/components/text-prettier.tsx";
import type { TextMessageProps } from "./types.ts";

export function TextMessageAbstract({
	message,
	...props
}: Omit<TextMessageProps, "variant">) {
	return (
		<span {...props}>
			<TextPrettier text={message.message_entity} inline formatLink={false} />
		</span>
	);
}
