import TextPrettier from "@/components/text-prettier.tsx";
import type React from "react";
import type { TextMessageProps } from "./types.ts";
import { textMessageVariants } from "./libs.ts";

export function TextMessageDefault({
	message,
	className,
	...props
}: Omit<TextMessageProps, "variant">) {
	return (
		<div
			className={textMessageVariants({
				variant: "default",
				direction: message.direction,
				className,
			})}
			{...props}
		>
			<TextPrettier text={message.message_entity} />
		</div>
	);
}
