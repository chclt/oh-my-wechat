import type { AppMessageProps } from "@/components/message/app-message.tsx";
import type { AppMessageTypeEnum } from "@/schema";

export interface RingtoneMessageEntity {
	type: AppMessageTypeEnum.RINGTONE;
	title: string;
	des: string;
}

type RingtoneMessageProps = AppMessageProps<RingtoneMessageEntity>;

export default function RingtoneMessage({
	message,
	variant = "default",
	...props
}: RingtoneMessageProps) {
	if (variant === "default")
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
	return (
		<div {...props}>
			<p>朋友使用的铃声 {message.message_entity.msg.appmsg.title})</p>
		</div>
	);
}
