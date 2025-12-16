import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import { Forward2OpenMessageEntity } from "@/schema/open-message.ts";

type ForwardMessage2Props = OpenMessageProps<Forward2OpenMessageEntity>;

export default function ForwardMessage2({
	message,
	variant = "default",
	...props
}: ForwardMessage2Props) {
	if (variant === "default") {
		return <ForwardMessage2Default message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <ForwardMessage2Abstract message={message} {...props} />;
	}
}

function ForwardMessage2Default({
	message,
	...props
}: Omit<ForwardMessage2Props, "variant">) {
	return (
		<div
			className={cn(
				"py-2.5 px-3 w-fit max-w-[20em] rounded-lg",
				["bg-[#95EB69] bubble-tail-r", "bg-white bubble-tail-l"][
					message.direction
				],
				"leading-normal break-words text-pretty",
				"space-y-2",
			)}
			{...props}
		>
			<h4 className="font-medium">
				{decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
			</h4>
			<div
				className={cn(
					"pl-2 pr-2.5 py-1 text-sm leading-normal text-neutral-600 border-l-2 rounded",
					[
						"bg-white/25 border-white/55",
						"bg-[rgba(222,222,222,0.3)] border-[rgba(193,193,193,0.6)]",
					][message.direction],
				)}
			>
				{message.message_entity.msg.appmsg.des}
			</div>
		</div>
	);
}

function ForwardMessage2Abstract({
	message,
	...props
}: Omit<ForwardMessage2Props, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			{decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
		</MessageInlineWrapper>
	);
}
