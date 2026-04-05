import { OpenMessageType } from "@/schema";
import { AttachOpenMessageEntity } from "@/schema/open-message";

export interface AttachMessageProps extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<AttachOpenMessageEntity>;
}
