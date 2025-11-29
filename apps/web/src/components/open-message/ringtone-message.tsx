import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import { RingtoneOpenMessageEntity } from "@/schema/open-message.ts";

type RingtoneMessageProps = OpenMessageProps<RingtoneOpenMessageEntity>;

export default function RingtoneMessage({
	message,
	variant = "default",
	...props
}: RingtoneMessageProps) {
	if (variant === "default") {
		return <RingtoneMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <RingtoneMessageAbstract message={message} {...props} />;
	}
}

function RingtoneMessageDefault({
	message,
	...props
}: Omit<RingtoneMessageProps, "variant">) {
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

function RingtoneMessageAbstract({
	message,
	...props
}: Omit<RingtoneMessageProps, "variant">) {
	return (
		<div {...props}>
			<p>朋友使用的铃声 {message.message_entity.msg.appmsg.title})</p>
		</div>
	);
}
