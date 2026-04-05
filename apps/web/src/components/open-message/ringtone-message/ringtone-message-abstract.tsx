import type { RingtoneMessageProps } from "./types";

export function RingtoneMessageAbstract({
	message,
	...props
}: RingtoneMessageProps) {
	return (
		<div {...props}>
			<p>朋友使用的铃声 {message.message_entity.msg.appmsg.title})</p>
		</div>
	);
}
