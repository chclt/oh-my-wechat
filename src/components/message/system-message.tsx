import type { MessageProp } from "@/components/message/message.tsx";
import type { SystemMessageType } from "@/lib/schema.ts";

type SystemMessageProp = MessageProp<SystemMessageType>;

export type SystemMessageEntity = string;

export default function SystemMessage({
	message,
	variant = "default",
	...props
}: SystemMessageProp) {
	const content = message.message_entity
		.split(/<[^>]+?>/)
		.map((s) => s)
		.join("");

	if (variant === "default")
		return (
			<div
				className="text-sm text-center text-pretty text-neutral-600"
				{...props}
			>
				<p className="px-2 py-1 box-decoration-clone">{content}</p>
			</div>
		);

	return <p>{content}</p>;
}
