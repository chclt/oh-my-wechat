import Image from "@/components/image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import {
	Card,
	CardContent,
	CardFooter,
	CardTitle,
} from "@/components/ui/card.tsx";
import type { AppMessageTypeEnum } from "@/schema";

export interface ChannelMessageEntity {
	type: AppMessageTypeEnum.CHANNEL;
	title: string;
	url: string;
	findernamecard: {
		username: string;
		avatar: string;
		nickname: string;
		auth_job: string;
		auth_icon: number;
		auth_icon_url: string;
		ecSource: string;
		content_type: number;
		lastGMsgID: string;
	};
}

type ChannelMessageProps = AppMessageProps<ChannelMessageEntity>;

export default function ChannelMessage({
	message,
	variant = "default",
	...props
}: ChannelMessageProps) {
	if (variant === "default")
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

	return (
		<MessageInlineWrapper message={message} {...props}>
			[视频号名片] {message.message_entity.msg.appmsg.findernamecard.nickname}
		</MessageInlineWrapper>
	);
}
