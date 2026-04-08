import type { MiniAppOpenMessageEntity, OpenMessageType } from "@repo/types";
import { MiniappMessage } from "@/components/open-message/index.ts";
import type { MiniappMessage2Props } from "./types";

export function MiniappMessage2Abstract({
	message,
	...props
}: Omit<MiniappMessage2Props, "accountId">) {
	return (
		<MiniappMessage.Abstract
			message={message as unknown as OpenMessageType<MiniAppOpenMessageEntity>}
			{...props}
		/>
	);
}
