import { textMessageVariants } from "@/components/message/text-message/libs.ts";
import { cn } from "@/lib/utils.ts";
import type { TextMessageProps } from "./types";

export function TextMessageDefault({ message, ...props }: TextMessageProps) {
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
