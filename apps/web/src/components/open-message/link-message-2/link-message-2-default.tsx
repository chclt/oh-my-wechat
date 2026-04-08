import { UrlMessage } from "@/components/open-message/index.ts";
import type { OpenMessageType, UrlOpenMessageEntity } from "@repo/types";
import type { LinkMessage2Props } from "./types";

export function LinkMessage2Default({ message, ...props }: LinkMessage2Props) {
	return (
		<UrlMessage.Default
			message={message as unknown as OpenMessageType<UrlOpenMessageEntity>}
			{...props}
		/>
	);
}
