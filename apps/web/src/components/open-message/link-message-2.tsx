import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import type { OpenMessageType } from "@/schema";
import {
	Link2OpenMessageEntity,
	UrlOpenMessageEntity,
} from "@/schema/open-message.ts";
import UrlMessage from "./url-message.tsx";

type LinkMessage2Props = OpenMessageProps<Link2OpenMessageEntity>;

export default function LinkMessage2({ message, ...props }: LinkMessage2Props) {
	return (
		<UrlMessage
			message={message as unknown as OpenMessageType<UrlOpenMessageEntity>}
			{...props}
		/>
	);
}
