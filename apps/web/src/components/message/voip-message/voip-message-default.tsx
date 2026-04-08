import { MessageDirection } from "@repo/types";
import { CallIncoming, CallOutgoing } from "@/components/icon.tsx";
import type { VoipMessageProps } from "./types.ts";

export function VoipMessageDefault({ message, ...props }: VoipMessageProps) {
	return (
		<>
			{message.message_entity.voipmsg && (
				<div
					className="max-w-[20em] py-4 pl-4 pr-6 flex gap-2.5 items-center bg-white rounded-2xl border border-neutral-200 [&_svg]:size-10 [&_svg]:shrink-0"
					{...props}
				>
					{message.direction === MessageDirection.outgoing ? (
						<CallOutgoing />
					) : (
						<CallIncoming />
					)}
					<div>
						<h4 className={"font-medium text-pretty"}>
							{message.from.remark ?? message.from.username}发起了
							{message.message_entity.voipmsg["@_type"] === "VoIPBubbleMsg" && (
								<>
									{message.message_entity.voipmsg[
										message.message_entity.voipmsg["@_type"]
									].room_type === 0 && "视频通话"}

									{message.message_entity.voipmsg[
										message.message_entity.voipmsg["@_type"]
									].room_type === 1 && "语音通话"}
								</>
							)}
						</h4>
						<p className={"text-sm text-neutral-600"}>
							{message.message_entity.voipmsg["@_type"] === "VoIPBubbleMsg" &&
								message.message_entity.voipmsg[
									message.message_entity.voipmsg["@_type"]
								].msg}
						</p>
					</div>
				</div>
			)}

			{message.message_entity.voipinvitemsg && (
				<div className="" {...props}>
					<p>通话邀请</p>
				</div>
			)}
		</>
	);
}
