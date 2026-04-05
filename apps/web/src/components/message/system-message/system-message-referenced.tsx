import { parseContent } from "./libs.ts";
import type { SystemMessageProps } from "./types.ts";

/** 当别的消息引用了一条后来被撤回的消息，就会出现引用了系统消息的情况 */
export function SystemMessageReferenced({
	message,
	...props
}: SystemMessageProps) {
	return (
		<div className={"inline"} {...props}>
			{parseContent(message)}
		</div>
	);
}
