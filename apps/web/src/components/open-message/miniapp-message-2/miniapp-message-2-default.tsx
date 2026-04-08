import type { MiniAppOpenMessageEntity, OpenMessageType } from "@repo/types";
import { MiniappMessage } from "@/components/open-message/index.ts";
import type { MiniappMessage2Props } from "./types";

export function MiniappMessage2Default({
	message,
	...props
}: MiniappMessage2Props) {
	return (
		<MiniappMessage.Default
			message={message as unknown as OpenMessageType<MiniAppOpenMessageEntity>}
			{...props}
		/>
	);
}
