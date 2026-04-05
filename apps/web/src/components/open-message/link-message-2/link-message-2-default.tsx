import { UrlMessage } from "@/components/open-message/index.ts";
import type { OpenMessageType } from "@/schema";
import type { UrlOpenMessageEntity } from "@/schema/open-message.ts";
import type { LinkMessage2Props } from "./types";

export function LinkMessage2Default({
	accountId,
	message,
	...props
}: LinkMessage2Props) {
	return (
		<UrlMessage.Default
			accountId={accountId}
			message={message as unknown as OpenMessageType<UrlOpenMessageEntity>}
			{...props}
		/>
	);
}
