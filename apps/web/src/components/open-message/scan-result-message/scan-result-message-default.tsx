import { LinkCard } from "@/components/link-card.tsx";
import type { ScanResultMessageProps } from "./types";

export function ScanResultMessageDefault({
	message,
	...props
}: ScanResultMessageProps) {
	return (
		<LinkCard
			heading={message.message_entity.msg.appmsg.title}
			abstract={`${message.message_entity.msg.appmsg.scanhistory.url}
${message.message_entity.msg.appmsg.scanhistory.time}`}
			from={
				// 偶尔 sourcedisplayname 是一个空字符串，会被 ?? 判定为有效，目前发现这种情况在"服务消息"里出现，但是服务消息本来就应该是另一个 UI，所以暂时先不处理了
				message.message_entity.msg?.appinfo?.appname
			}
			{...props}
		/>
	);
}
