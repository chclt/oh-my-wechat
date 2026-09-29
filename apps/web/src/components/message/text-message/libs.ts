import { MessageDirection } from "@repo/types";
import { cva } from "class-variance-authority";

export const textMessageVariants = cva(
	[
		"py-2.5 px-3 w-fit max-w-[20em] min-h-11 rounded-lg",
		"leading-normal break-words text-pretty",
		"[&>p]:min-h-[1.5em]",
	],
	{
		variants: {
			variant: {
				default: [],
				referenced: [],
			},
			direction: {
				[MessageDirection.outgoing]: ["bg-[#95EB69] bubble-tail-r"],
				[MessageDirection.incoming]: ["bg-white bubble-tail-l"],
			},
		},
	},
);
