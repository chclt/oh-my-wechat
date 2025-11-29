import { MegaphoneSolid } from "@/components/central-icon.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { textMessageVariants } from "@/components/message/text-message.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import TextPrettier from "@/components/text-prettier.tsx";
import { cn } from "@/lib/utils.ts";
import { AnnouncementOpenMessageEntity } from "@/schema/open-message.ts";

type AnnouncementMessageProps = OpenMessageProps<AnnouncementOpenMessageEntity>;

export default function AnnouncementMessage({
	message,
	variant = "default",
	...props
}: AnnouncementMessageProps) {
	if (variant === "default") {
		return <AnnouncementMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <AnnouncementMessageAbstract message={message} {...props} />;
	}
}

function AnnouncementMessageDefault({
	message,
	...props
}: Omit<AnnouncementMessageProps, "variant">) {
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
			<span
				className={
					"mt-0.5 mb-2 h-4 flex items-center gap-1 text-[13px] text-black/55 [&_svg]:size-4"
				}
			>
				<MegaphoneSolid className={"text-[#FFCA0C]"} />
				公告
			</span>
			<TextPrettier text={message.message_entity.msg.appmsg.textannouncement} />
		</div>
	);
}

function AnnouncementMessageAbstract({
	message,
	...props
}: Omit<AnnouncementMessageProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			[公告] {message.message_entity.msg.appmsg.textannouncement}
		</MessageInlineWrapper>
	);
}
