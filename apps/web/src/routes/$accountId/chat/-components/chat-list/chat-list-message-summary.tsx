import {
	MessageDirection,
	MessageTypeEnum,
	type MessageType,
} from "@repo/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { HTMLAttributes } from "react";
import { useAccount } from "@/components/account-provider";
import { ChatUiConfigProvider } from "@/components/chat-ui-config-provider";
import Message from "@/components/message/message";
import User from "@/components/user";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account";
import { cn } from "@/lib/utils";

interface ChatListMessageSummaryProps extends HTMLAttributes<HTMLSpanElement> {
	message: MessageType;
	showUsername: boolean;
}

export default function ChatListMessageSummary({
	message,
	showUsername,
	className,
	...props
}: ChatListMessageSummaryProps) {
	const { accountId } = useAccount();
	const { data: account } = useSuspenseQuery(
		AccountSuspenseQueryOptions({ account: { id: accountId } }),
	);
	const sender =
		message.direction === MessageDirection.outgoing && account
			? account
			: message.from;

	return (
		<ChatUiConfigProvider value={{ showUsername, showPhoto: false }}>
			{/* Migrate one message type at a time; other types still own their sender prefix. */}
			{message.type === MessageTypeEnum.TEXT ? (
				<span className={cn("min-w-0 max-w-full", className)} {...props}>
					{showUsername && sender && (
						<>
							<User user={sender} variant="inline" showPhoto={false} />
							{": "}
						</>
					)}
					<Message message={message} variant="abstract" />
				</span>
			) : (
				<Message
					message={message}
					variant="abstract"
					className={className}
					{...props}
				/>
			)}
		</ChatUiConfigProvider>
	);
}
