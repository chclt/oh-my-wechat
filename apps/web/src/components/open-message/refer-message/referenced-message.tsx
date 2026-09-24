import {
	MessageDirection,
	MessageTypeEnum,
	type MessageType,
} from "@repo/types";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { HTMLAttributes } from "react";
import { useAccount } from "@/components/account-provider";
import Message from "@/components/message/message";
import User from "@/components/user";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account";

interface ReferencedMessageProps extends HTMLAttributes<HTMLSpanElement> {
	message: MessageType;
}

export default function ReferencedMessage({
	message,
	...props
}: ReferencedMessageProps) {
	const { accountId } = useAccount();
	const { data: account } = useSuspenseQuery(
		AccountSuspenseQueryOptions({ account: { id: accountId } }),
	);
	const sender =
		message.direction === MessageDirection.outgoing && account
			? account
			: message.from;

	// Migrate one message type at a time; other types still own their sender prefix.
	if (message.type !== MessageTypeEnum.TEXT)
		return <Message message={message} variant="referenced" {...props} />;

	return (
		<span {...props}>
			{sender && (
				<>
					<User user={sender} variant="inline" showPhoto />
					{": "}
				</>
			)}
			<Message message={message} variant="referenced" />
		</span>
	);
}
