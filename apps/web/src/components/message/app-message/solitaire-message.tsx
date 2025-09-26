import { TripleCircleIcon } from "@/components/icon.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import { textMessageVariants } from "@/components/message/text-message.tsx";
import TextPrettier from "@/components/text-prettier";
import { cn } from "@/lib/utils.ts";
import type { AppMessageTypeEnum } from "@/schema";

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
	if (variant === "default") {
		return <SolitaireMessageDefault message={message} {...props} />;
	} else if (variant === "referenced" || variant === "abstract") {
		return <SolitaireMessageAbstract message={message} {...props} />;
	}
}

function SolitaireMessageDefault({
	message,
	...props
}: Omit<SolitaireProps, "variant">) {
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
				<TripleCircleIcon />
				接龙
			</span>

			<TextPrettier text={message.message_entity.msg.appmsg.title} />
		</div>
	);
}

function SolitaireMessageAbstract({
	message,
	...props
}: Omit<SolitaireProps, "variant">) {
	return (
		<MessageInlineWrapper message={message} {...props}>
			{message.message_entity.msg.appmsg.title}
		</MessageInlineWrapper>
	);
}
