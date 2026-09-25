import type { MessageType } from "@repo/types";
import type React from "react";
import { useChatUiConfig } from "@/components/chat-ui-config-provider.tsx";
import { cn } from "@/lib/utils";
import User from "./user";

interface MessageInlineWrapperProps extends React.HTMLAttributes<HTMLSpanElement> {
	message: MessageType;
}

export default function MessageInlineWrapper({
	message,

	children,
	className,
	...props
}: MessageInlineWrapperProps) {
	const { showUsername, showPhoto } = useChatUiConfig();
	const displayUsername = showUsername && !!message.from;

	return (
		<span className={cn("block min-w-0 max-w-full", className)} {...props}>
			{displayUsername && (
				<User user={message.from} variant={"inline"} showPhoto={showPhoto} />
			)}
			{displayUsername && ": "}
			{children}
		</span>
	);
}
