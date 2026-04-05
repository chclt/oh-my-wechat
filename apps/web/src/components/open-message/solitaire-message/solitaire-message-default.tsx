import { TripleCircleIcon } from "@/components/icon.tsx";
import { textMessageVariants } from "@/components/message/text-message/libs.ts";
import TextPrettier from "@/components/text-prettier.tsx";
import { cn } from "@/lib/utils.ts";
import type { SolitaireMessageProps } from "./types";

export function SolitaireMessageDefault({
	message,
	...props
}: SolitaireMessageProps) {
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
