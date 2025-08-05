import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import Message from "@/components/message/message.tsx";
import {
	FormatTextMessageContent,
	textMessageVariants,
} from "@/components/message/text-message.tsx";
import User from "@/components/user.tsx";
import type { AppMessageTypeEnum } from "@/lib/schema.ts";
import { cn } from "@/lib/utils";

export interface ReferMessageEntity {
	type: AppMessageTypeEnum.REFER;
	title: string;
	refermsg: {
		type: number;
		svrid: string;
		fromusr: string;
		chatusr: string;
		displayname: string;
		msgsource: string; // xml
		content: string;
	};
}

type ReferMessageProps = AppMessageProps<ReferMessageEntity>;

export default function ReferMessage({
	message,
	variant = "default",
	...props
}: ReferMessageProps) {
	if (variant === "default")
		return (
			<div
				className={cn(
					textMessageVariants({
						variant,
						direction: message.direction,
					}),
				)}
				{...props}
			>
				<FormatTextMessageContent
					text={message.message_entity.msg.appmsg.title}
				/>

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
						<Message
							variant={"referenced"}
							message={message.reply_to_message}
							direction={message.direction}
						/>
					) : (
						//  TODO 当引用了一个不存在的消息（比如加入群之前的消息），content 是一个 xml
						<FormatTextMessageContent
							text={message.message_entity.msg.appmsg.refermsg.content}
						/>
					)}
				</div>
			</div>
		);

	if (variant === "referenced")
		return (
			<p>
				<User user={message.from} variant="inline" />
				<span>: </span>
				<span>
					<FormatTextMessageContent
						text={message.message_entity.msg.appmsg.title}
						className={"inline"}
					/>{" "}
				</span>
			</p>
		);

	return (
		<MessageInlineWrapper message={message} {...props}>
			<FormatTextMessageContent
				text={message.message_entity.msg.appmsg.title}
				className={"inline"}
			/>
		</MessageInlineWrapper>
	);
}
