import type React from "react";
import TextPrettier from "@/components/text-prettier.tsx";
import User from "@/components/user.tsx";
import type { TextMessageProps } from "./types.ts";

export function TextMessageReferenced({
	message,
	...props
}: Omit<TextMessageProps, "variant">) {
	return (
		<div className={"inline"} {...props}>
			<User user={message.from} variant={"inline"} />
			<span>: </span>
			<TextPrettier text={message.message_entity} inline />
		</div>
	);
}
