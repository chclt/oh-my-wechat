import type { RedEnvelopeOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface RedEnvelopeMessageProps
	extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<RedEnvelopeOpenMessageEntity>;
}
