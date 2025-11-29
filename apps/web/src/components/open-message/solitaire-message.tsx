import { TripleCircleIcon } from "@/components/icon.tsx";
import MessageInlineWrapper from "@/components/message-inline-wrapper.tsx";
import { textMessageVariants } from "@/components/message/text-message.tsx";
import type { OpenMessageProps } from "@/components/open-message/open-message.tsx";
import TextPrettier from "@/components/text-prettier.tsx";
import { cn } from "@/lib/utils.ts";
import { SolitaireOpenMessageEntity } from "@/schema/open-message.ts";

type SolitaireProps = OpenMessageProps<SolitaireOpenMessageEntity>;

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
