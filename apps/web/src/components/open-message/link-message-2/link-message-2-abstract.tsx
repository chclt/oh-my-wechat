import { UrlMessage } from "@/components/open-message/index.ts";
import type { OpenMessageType, UrlOpenMessageEntity } from "@repo/types";
import type { LinkMessage2Props } from "./types";

export function LinkMessage2Abstract({
	message,
	...props
}: Omit<LinkMessage2Props, "accountId">) {
	return (
		<UrlMessage.Abstract
			message={message as unknown as OpenMessageType<UrlOpenMessageEntity>}
			{...props}
		/>
	);
}
