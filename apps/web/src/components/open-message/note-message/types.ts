import { OpenMessageType } from "@/schema";
import type { NoteOpenMessageEntity } from "@/schema/open-message";

export interface NoteMessageProps extends React.HTMLAttributes<HTMLElement> {
	accountId: string;
	message: OpenMessageType<NoteOpenMessageEntity>;
}
