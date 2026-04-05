import { AttachMessage } from "..";
import type { Attach2MessageProps } from "./types";

export function Attach2MessageAbstract({
	message,
	...props
}: Omit<Attach2MessageProps, "accountId">) {
	return (
		<AttachMessage.Abstract
			message={message as unknown as AttachMessage.Props["message"]}
			{...props}
		/>
	);
}
