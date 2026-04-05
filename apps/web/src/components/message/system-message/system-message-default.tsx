import { parseContent } from "./libs.ts";
import type { SystemMessageProps } from "./types.ts";

export function SystemMessageDefault({
	message,
	...props
}: SystemMessageProps) {
	return (
		<div
			className="text-sm text-center text-pretty text-neutral-600"
			{...props}
		>
			<p className="px-2 py-1 box-decoration-clone">{parseContent(message)}</p>
		</div>
	);
}
