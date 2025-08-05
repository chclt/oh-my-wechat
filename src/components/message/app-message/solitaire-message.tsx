import { TripleCircleIcon } from "@/components/icon.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import {
	FormatTextMessageContent,
	textMessageVariants,
} from "@/components/message/text-message.tsx";
import type { AppMessageTypeEnum } from "@/schema";
import { cn } from "@/lib/utils.ts";

export interface SolitaireMessageEntity {
	type: AppMessageTypeEnum.SOLITAIRE;
	title: string;
	des: string;
	extinfo: {
		solitaire_info: string; // xml
	};
}

type SolitaireProps = AppMessageProps<SolitaireMessageEntity>;

export default function SolitaireMessage({
	message,
	variant = "default",
	...props
}: SolitaireProps) {
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
					<TripleCircleIcon />
					接龙
				</span>

				<FormatTextMessageContent
					text={message.message_entity.msg.appmsg.title}
				/>
			</div>
		);

	return (
		<MessageInlineWrapper message={message} {...props}>
			{message.message_entity.msg.appmsg.title}
		</MessageInlineWrapper>
	);
}
