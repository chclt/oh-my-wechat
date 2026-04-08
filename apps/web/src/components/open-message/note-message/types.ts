import type { NoteOpenMessageEntity } from "@repo/types";
import { OpenMessageType } from "@repo/types";

export interface NoteMessageProps extends React.HTMLAttributes<HTMLElement> {
	message: OpenMessageType<NoteOpenMessageEntity>;
}
