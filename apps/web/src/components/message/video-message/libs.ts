import { MessageDirection } from "@repo/types";
import { cva } from "class-variance-authority";

export const videoMessageVariants = cva(
	["max-w-[20em] min-w-32 min-h-32 rounded-lg overflow-hidden"],
	{
		variants: {
			variant: {
				default: [],
			},
			direction: {
				[MessageDirection.outgoing]: ["mask-bubble-tail-r mr-[-5px]"],
				[MessageDirection.incoming]: ["mask-bubble-tail-l ml-[-5px]"],
			},
		},
	},
);
