import { CallIncoming, CallOutgoing } from "@/components/icon.tsx";
import { MessageDirection } from "@/schema";
import type { ChatroomVoipMessageProps } from "./types.ts";

export function ChatroomVoipMessageDefault({
	message,
	...props
}: ChatroomVoipMessageProps) {
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
