import Image from "@/components/image.tsx";
import {
	Card,
	CardContent,
	CardFooter,
	CardTitle,
} from "@/components/ui/card.tsx";
import type { ChannelMessageProps } from "./types";

export function ChannelMessageDefault({
	message,
	...props
}: ChannelMessageProps) {
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
