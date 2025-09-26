import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { MessageProp } from "@/components/message/message.tsx";
import TextPrettier from "@/components/text-prettier.tsx";
import User from "@/components/user.tsx";
import { MessageDirection, type TextMessageType } from "@/schema";
import { cva } from "class-variance-authority";
import type React from "react";

type TextMessageProps = MessageProp<TextMessageType> &
	React.HTMLAttributes<HTMLElement>;

export type TextMessageEntity = string;

export const textMessageVariants = cva(
	[
		"py-2.5 px-3 w-fit max-w-[20em] min-h-11 rounded-lg",
		"leading-normal break-words text-pretty",
		"[&>p]:min-h-[1.5em] [&_a]:text-blue-500 [&_a]:underline",
	],
	{
		variants: {
			variant: {
				default: [],
				referenced: [],
			},
			direction: {
				[MessageDirection.outgoing]: ["bg-[#95EB69] bubble-tail-r"],
				[MessageDirection.incoming]: ["bg-white bubble-tail-l"],
			},
		},
	},
);

export default function TextMessage({
	message,
	variant = "default",
	className,
	...props
}: TextMessageProps) {
	if (variant === "default") {
		return <TextMessageDefault message={message} {...props} />;
	} else if (variant === "referenced") {
		return <TextMessageReferenced message={message} {...props} />;
	} else if (variant === "abstract") {
		return <TextMessageAbstract message={message} {...props} />;
	}
}

function TextMessageDefault({
	message,
	className,
	...props
}: Omit<TextMessageProps, "variant">) {
	return (
		<div
			className={textMessageVariants({
				variant: "default",
				direction: message.direction,
				className,
			})}
			{...props}
		>
			<TextPrettier text={message.message_entity} />
		</div>
	);
}

function TextMessageReferenced({
	message,
	...props
}: Omit<TextMessageProps, "variant">) {
	return (
		<div className={"inline"} {...props}>
			<User user={message.from} variant={"inline"} />
			<span>: </span>
			<TextPrettier text={message.message_entity} className={"inline"} />
		</div>
	);
}

function TextMessageAbstract({
	message,
	...props
}: Omit<TextMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			<TextPrettier text={message.message_entity} className={"inline"} />
		</MessageInlineWrapper>
	);
}
