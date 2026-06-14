import { HTMLProps } from "react";
import { cn } from "@/lib/utils.ts";

interface MessageResultTitleProps extends HTMLProps<HTMLDivElement> {}

export function MessageResultTitle({
	className,
	...props
}: MessageResultTitleProps) {
	return (
		<div
			className={cn(
				"sticky z-10 top-0 h-11 ps-5 flex items-center texture",
				className,
			)}
			{...props}
		>
			<div className="h-full w-full min-w-0 ps-0.5 pe-5 flex items-center gap-2 border-b border-muted text-sm text-muted-foreground">
				聊天记录
			</div>
		</div>
	);
}
