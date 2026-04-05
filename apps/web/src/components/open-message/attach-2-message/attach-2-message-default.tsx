import { AttachMessage } from "..";
import type { Attach2MessageProps } from "./types";

export function Attach2MessageDefault({
	accountId,
	message,
	...props
}: Attach2MessageProps) {
	return (
		<AttachMessage.Default
			accountId={accountId}
			message={message as unknown as AttachMessage.Props["message"]}
			{...props}
		/>
	);
}
