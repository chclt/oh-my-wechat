import TextPrettier from "@/components/text-prettier.tsx";
import User from "@/components/user.tsx";
import type { ReferMessageProps } from "./types";

export function ReferMessageReferenced({
	message,
	...props
}: ReferMessageProps) {
	return (
		<p>
			<User user={message.from} variant="inline" />
			<span>: </span>
			<span>
				<TextPrettier
					text={message.message_entity.msg.appmsg.title}
					inline
				/>{" "}
			</span>
		</p>
	);
}
