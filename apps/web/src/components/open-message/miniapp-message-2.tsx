import MiniappMessage from "@/components/open-message/miniapp-message.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import type { OpenMessageType } from "@/schema";
import {
	MiniApp2OpenMessageEntity,
	MiniAppOpenMessageEntity,
} from "@/schema/open-message.ts";

type MiniappMessage2Props = OpenMessageProps<MiniApp2OpenMessageEntity>;

export default function MiniappMessage2({
	message,
	...props
}: MiniappMessage2Props) {
	return (
		<MiniappMessage
			message={message as unknown as OpenMessageType<MiniAppOpenMessageEntity>}
			{...props}
		/>
	);
}
