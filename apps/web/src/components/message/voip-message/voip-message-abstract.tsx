import type { VoipMessageProps } from "./types.ts";

export function VoipMessageAbstract({ message, ...props }: VoipMessageProps) {
	return (
		<p>
			{message.message_entity.voipmsg && (
				<span>
					[语音通话]{" "}
					{message.message_entity.voipmsg["@_type"] === "VoIPBubbleMsg" &&
						message.message_entity.voipmsg[
							message.message_entity.voipmsg["@_type"]
						].msg}
				</span>
			)}

			{message.message_entity.voipinvitemsg && <span>通话邀请</span>}
		</p>
	);
}
