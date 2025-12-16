import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import Message from "@/components/message/message.tsx";
import { textMessageVariants } from "@/components/message/text-message.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import TextPrettier from "@/components/text-prettier.tsx";
import User from "@/components/user.tsx";
import { cn } from "@/lib/utils.ts";
import { ReferOpenMessageEntity } from "@/schema/open-message.ts";

type ReferMessageProps = OpenMessageProps<ReferOpenMessageEntity>;

export default function ReferMessage({
	message,
	variant = "default",
	...props
}: ReferMessageProps) {
	if (variant === "default") {
		return <ReferMessageDefault message={message} {...props} />;
	} else if (variant === "referenced") {
		return <ReferMessageReferenced message={message} {...props} />;
	} else if (variant === "abstract") {
		return <ReferMessageAbstract message={message} {...props} />;
	}
}

function ReferMessageDefault({
	message,
	...props
}: Omit<ReferMessageProps, "variant">) {
	return (
		<div
			className={cn(
				textMessageVariants({
					variant: "default",
					direction: message.direction,
				}),
			)}
			{...props}
		>
			<TextPrettier text={message.message_entity.msg.appmsg.title} />

			<div
				className={cn(
					"mt-2 pl-1.5 pr-2.5 py-1 text-sm leading-normal text-neutral-600 border-l-2 rounded",
					[
						"bg-white/25 border-white/55",
						"bg-[rgba(222,222,222,0.3)] border-[rgba(193,193,193,0.6)]",
					][message.direction],
				)}
			>
				{message.reply_to_message ? (
					<Message variant="referenced" message={message.reply_to_message} />
				) : (
					//  TODO 当引用了一个不存在的消息（比如加入群之前的消息），content 是一个 xml
					<TextPrettier
						text={message.message_entity.msg.appmsg.refermsg.content}
					/>
				)}
			</div>
		</div>
	);
}

function ReferMessageReferenced({
	message,
	...props
}: Omit<ReferMessageProps, "variant">) {
	return (
		<p>
			<User user={message.from} variant="inline" />
			<span>: </span>
			<span>
				<TextPrettier
					text={message.message_entity.msg.appmsg.title}
					inline
				/>{" "}
			</span>
		</p>
	);
}

function ReferMessageAbstract({
	message,
	...props
}: Omit<ReferMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			<TextPrettier text={message.message_entity.msg.appmsg.title} inline />
		</MessageInlineWrapper>
	);
}
