import type { RingtoneMessageProps } from "./types";

export function RingtoneMessageDefault({
	message,
	...props
}: RingtoneMessageProps) {
	return (
		<div
			className="text-sm text-center text-pretty text-neutral-600"
			{...props}
		>
			<p className="px-2 py-1 box-decoration-clone">
				朋友使用的铃声 {message.message_entity.msg.appmsg.title}
			</p>
		</div>
	);
}
