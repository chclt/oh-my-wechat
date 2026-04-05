import type { MessageType } from "@/schema";
import type React from "react";
import User from "./user";
import { useChatUiConfig } from "@/components/chat-ui-config-provider.tsx";

interface MessageInlineWrapperProps
	extends React.HTMLAttributes<HTMLParagraphElement> {
	message: MessageType;
}

export default function MessageInlineWrapper({
	message,

	children,
	className,
	...props
}: MessageInlineWrapperProps) {
	const { showUsername, showPhoto } = useChatUiConfig();

	return (
		<p className={className} {...props}>
			{showUsername && (
				<User user={message.from} variant={"inline"} showPhoto={showPhoto} />
			)}
			{showUsername && ": "}
			{children}
		</p>
	);
}
