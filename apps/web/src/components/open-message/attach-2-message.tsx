import AttachMessage from "@/components/open-message/attach-message.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import type { OpenMessageType } from "@/schema";
import {
	Attach2OpenMessageEntity,
	AttachOpenMessageEntity,
} from "@/schema/open-message.ts";

type AttachMessage2Props = OpenMessageProps<Attach2OpenMessageEntity>;

export default function Attach2Message({
	message,
	...props
}: AttachMessage2Props) {
	return (
		<AttachMessage
			message={message as unknown as OpenMessageType<AttachOpenMessageEntity>}
			{...props}
		/>
	);
}
