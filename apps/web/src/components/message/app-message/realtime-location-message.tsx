import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import type { AppMessageTypeEnum } from "@/schema";

export interface RealtimeLocationMessageEntity {
	type: AppMessageTypeEnum.REALTIME_LOCATION;
	title: string; // eg. "我发起了位置共享"
}

type RealtimeLocationMessageProps =
	AppMessageProps<RealtimeLocationMessageEntity>;

export default function RealtimeLocationMessage({
	message,
	variant = "default",
	...props
}: RealtimeLocationMessageProps) {
	if (variant === "default") {
		return <RealtimeLocationMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <RealtimeLocationMessageAbstract message={message} {...props} />;
	}
}

function RealtimeLocationMessageDefault({
	message,
	...props
}: Omit<RealtimeLocationMessageProps, "variant">) {
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

function RealtimeLocationMessageAbstract({
	message,
	...props
}: Omit<RealtimeLocationMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[位置共享] {message.from.remark ?? message.from.username}发起了位置共享)
		</MessageInlineWrapper>
	);
}
