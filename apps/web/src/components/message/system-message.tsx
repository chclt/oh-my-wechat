import type { MessageProp } from "@/components/message/message.tsx";
import type { SystemMessageType } from "@/schema";

type SystemMessageProp = MessageProp<SystemMessageType>;

export type SystemMessageEntity = string;

export default function SystemMessage({
	message,
	variant = "default",
	...props
}: SystemMessageProp) {
	if (variant === "default") {
		return <SystemMessageDefault message={message} {...props} />;
	} else if (variant === "referenced") {
		return <SystemMessageReferenced message={message} {...props} />;
	} else if (variant === "abstract") {
		return <SystemMessageAbstract message={message} {...props} />;
	}
}

function SystemMessageDefault({
	message,
	...props
}: Omit<SystemMessageProp, "variant">) {
	return (
		<div
			className="text-sm text-center text-pretty text-neutral-600"
			{...props}
		>
			<p className="px-2 py-1 box-decoration-clone">{parseContent(message)}</p>
		</div>
	);
}

/** 当别的消息引用了一条后来被撤回的消息，就会出现引用了系统消息的情况 */
function SystemMessageReferenced({
	message,
	...props
}: Omit<SystemMessageProp, "variant">) {
	return (
		<div className={"inline"} {...props}>
			{parseContent(message)}
		</div>
	);
}

function SystemMessageAbstract({
	message,
	...props
}: Omit<SystemMessageProp, "variant">) {
	return <p>{parseContent(message)}</p>;
}

function parseContent(message: SystemMessageType) {
	return message.message_entity
		.split(/<[^>]+?>/)
		.map((s) => s)
		.join("");
}
