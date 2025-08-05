import type { MessageType } from "@/schema";
import User from "../user";

interface MessageInlineProps
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
}: MessageInlineProps) {
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
