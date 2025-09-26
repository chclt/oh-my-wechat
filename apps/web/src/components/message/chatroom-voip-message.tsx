import { CallIncoming, CallOutgoing } from "@/components/icon.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import { type ChatroomVoipMessageType, MessageDirection } from "@/schema";

type ChatroomVoipMessageProps = MessageProp<ChatroomVoipMessageType>;

export interface ChatroomVoipMessageEntity {
	msgLocalID: number;
	clientGroupID: string;
	groupID: string;
	lastMsgID: number;
	msgContent: string; // eg. "XXX has started a voice call"
}

export default function ChatroomVoipMessage({
	message,
	variant = "default",
	...props
}: ChatroomVoipMessageProps) {
	if (variant === "default") {
		return <ChatroomVoipMessageDefault message={message} {...props} />;
	} else if (variant === "abstract") {
		return <ChatroomVoipMessageAbstract message={message} {...props} />;
	}
}

function ChatroomVoipMessageDefault({
	message,
	...props
}: Omit<ChatroomVoipMessageProps, "variant">) {
	return (
		<>
			{message.from ? (
				<div
					className="max-w-[20em] py-4 pl-4 pr-6 flex gap-2.5 items-center bg-white rounded-2xl border border-neutral-200 [&_svg]:size-10 [&_svg]:shrink-0"
					{...props}
				>
					{message.direction === MessageDirection.outgoing ? (
						<CallOutgoing />
					) : (
						<CallIncoming />
					)}
					<div className={"font-medium text-pretty"}>
						<p>{message.message_entity.msgContent}</p>
					</div>
				</div>
			) : (
				<div
					className="text-sm text-center text-pretty text-neutral-600"
					{...props}
				>
					<p className="px-2 py-1 box-decoration-clone">
						{message.message_entity.msgContent}
					</p>
				</div>
			)}
		</>
	);
}

function ChatroomVoipMessageAbstract({
	message,
	...props
}: Omit<ChatroomVoipMessageProps, "variant">) {
	return (
		<div className={"mx-auto text-sm text-neutral-600"} {...props}>
			<p>{message.message_entity.msgContent}</p>
		</div>
	);
}
