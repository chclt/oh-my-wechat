import { parseContent } from "./libs.ts";
import type { SystemMessageProps } from "./types.ts";

export function SystemMessageAbstract({
	message,
	...props
}: SystemMessageProps) {
	return <p>{parseContent(message)}</p>;
}
