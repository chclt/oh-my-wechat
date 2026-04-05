import type { ScanResultMessageProps } from "./types";

export function ScanResultMessageAbstract({
	message,
	...props
}: ScanResultMessageProps) {
	return (
		<div {...props}>
			<p>扫码结果通知 {message.message_entity.msg.appmsg.title})</p>
		</div>
	);
}
