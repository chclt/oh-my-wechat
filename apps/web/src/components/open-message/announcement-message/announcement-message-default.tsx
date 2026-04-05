import { MegaphoneSolid } from "@/components/central-icon.tsx";
import { textMessageVariants } from "@/components/message/text-message/libs.ts";
import TextPrettier from "@/components/text-prettier.tsx";
import { cn } from "@/lib/utils.ts";
import type { AnnouncementMessageProps } from "./types";

export function AnnouncementMessageDefault({
	message,
	...props
}: AnnouncementMessageProps) {
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
