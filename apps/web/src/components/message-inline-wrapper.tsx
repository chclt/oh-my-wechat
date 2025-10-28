import type { MessageType } from "@/schema";
import type React from "react";
import User from "./user";

interface MessageInlineWrapperProps
	extends React.HTMLAttributes<HTMLParagraphElement> {
	message: MessageType;

	showUsername?: boolean;
	showPhoto?: boolean;
}

export default function MessageInlineWrapper({
	message,
	showUsername = true,
	showPhoto = true,

	children,
	className,
	...props
}: MessageInlineWrapperProps) {
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
