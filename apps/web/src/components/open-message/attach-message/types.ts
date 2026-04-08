import { AttachOpenMessageEntity, OpenMessageType } from "@repo/types";

export interface AttachMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<AttachOpenMessageEntity>;
}
