import { OpenMessageType } from "@/schema";
import type { RedEnvelopeOpenMessageEntity } from "@/schema/open-message";

export interface RedEnvelopeMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<RedEnvelopeOpenMessageEntity>;
}
