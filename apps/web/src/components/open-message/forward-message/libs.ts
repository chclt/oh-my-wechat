import { ForwardMessageRecordItemType, MessageDirection } from "@repo/types";
import { cva } from "class-variance-authority";

export interface ForwardMessageContent {
	recordinfo: {
		title: string;
		desc: string;
		datalist: {
			dataitem: ForwardMessageRecordItemType[];
		};
		favusername: string;
	};
}

export const forwardMessageVariants = cva(
	[
		"py-2.5 px-3 w-fit max-w-[20em] rounded-lg",
		"leading-normal break-words text-pretty",
		"space-y-2 relative",
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

export const forwardMessageRecordVariants = cva(
	[
		"pl-2 pr-2.5 py-1 text-sm leading-normal text-neutral-600 border-l-2 rounded",
		"max-h-[20em] overflow-hidden",
	],
	{
		variants: {
			variant: {
				default: [],
				referenced: [],
			},
			direction: {
				[MessageDirection.outgoing]: ["bg-white/25 border-white/55"],
				[MessageDirection.incoming]: [
					"bg-[rgba(222,222,222,0.3)] border-[rgba(193,193,193,0.6)]",
				],
			},
		},
	},
);
