import type { RealtimeLocationMessageProps } from "./types";

export function RealtimeLocationMessageDefault({
	message,
	...props
}: RealtimeLocationMessageProps) {
	return (
		<div
			className="w-64 py-4 pl-4 pr-6 flex gap-4 items-center bg-white rounded-2xl border border-neutral-200"
			{...props}
		>
			<div className={"shrink-0 size-12 bg-neutral-400 rounded-full"} />
			<div>
				<h4 className={"font-medium"}>
					{message.from.remark ?? message.from.username}发起了位置共享
				</h4>
			</div>
		</div>
	);
}
