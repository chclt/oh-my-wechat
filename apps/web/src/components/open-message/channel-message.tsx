import Image from "@/components/image.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import {
	Card,
	CardContent,
	CardFooter,
	CardTitle,
} from "@/components/ui/card.tsx";

import { ChannelOpenMessageEntity } from "@/schema/open-message.ts";

type ChannelMessageProps = OpenMessageProps<ChannelOpenMessageEntity>;

export default function ChannelMessage({
	message,
	variant = "default",
	...props
}: ChannelMessageProps) {
	if (variant === "default") {
		return <ChannelMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <ChannelMessageAbstract message={message} {...props} />;
	}
}

function ChannelMessageDefault({
	message,
	...props
}: Omit<ChannelMessageProps, "variant">) {
	return (
		<Card className="max-w-[20em] w-fit" {...props}>
			<CardContent className={"p-2.5 pr-4 flex items-center gap-4"}>
				<Image
					src={message.message_entity.msg.appmsg.findernamecard.avatar}
					className={"shrink-0 size-12 rounded-full"}
				/>
				<CardTitle>
					{message.message_entity.msg.appmsg.findernamecard.nickname}
				</CardTitle>
			</CardContent>
			<CardFooter>频道名片</CardFooter>
		</Card>
	);
}

function ChannelMessageAbstract({
	message,
	...props
}: Omit<ChannelMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[频道名片] {message.message_entity.msg.appmsg.findernamecard.nickname}
		</MessageInlineWrapper>
	);
}
