import { MiniappMessage } from "@/components/open-message/index.ts";
import type { OpenMessageType } from "@/schema";
import type { MiniAppOpenMessageEntity } from "@/schema/open-message.ts";
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
