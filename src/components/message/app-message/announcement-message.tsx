import { MegaphoneSolid } from "@/components/central-icon.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import {
	FormatTextMessageContent,
	textMessageVariants,
} from "@/components/message/text-message.tsx";
import type { AppMessageTypeEnum } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

export interface AnnouncementMessageEntity {
	type: AppMessageTypeEnum.ANNOUNCEMENT;
	url: string;
	announcement: string; // xml
	textannouncement: string;
	xmlpuretext: number;
}

type AnnouncementMessageProps = AppMessageProps<AnnouncementMessageEntity>;

export default function AnnouncementMessage({
	message,
	variant = "default",
	...props
}: AnnouncementMessageProps) {
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
				<span
					className={
						"mt-0.5 mb-2 h-4 flex items-center gap-1 text-[13px] text-black/55 [&_svg]:size-4"
					}
				>
					<MegaphoneSolid className={"text-[#FFCA0C]"} />
					公告
				</span>
				<FormatTextMessageContent
					text={message.message_entity.msg.appmsg.textannouncement}
				/>
			</div>
		);

	return (
		<MessageInlineWrapper message={message} {...props}>
			[公告] {message.message_entity.msg.appmsg.textannouncement})
		</MessageInlineWrapper>
	);
}
