import type { MessageType } from "@repo/types";
import { MessageDirection, type UserType } from "@repo/types";
import type React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useChatUiConfig } from "@/components/chat-ui-config-provider.tsx";
import User from "@/components/user.tsx";
import { cn } from "@/lib/utils.ts";
import Message from "./message/message.tsx";

interface BubbleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	user: UserType;
	messages?: MessageType[];
}

export function MessageBubbleGroup({
	user,
	messages = [],

	className,
	children,
	...props
}: BubbleGroupProps) {
	const { showUsername, showPhoto } = useChatUiConfig();

	const messageDirection = messages[0]?.direction ?? MessageDirection.incoming;

	return (
		<ErrorBoundary
			onError={(error) => {
				console.error(error);
			}}
			fallback={
				<div
					onDoubleClick={() => {
						if (import.meta.env.DEV) console.log(messages);
					}}
				>
					解析失败：消息组
				</div>
			}
		>
			<div
				className={cn(
					"flex gap-x-3",
					["flex-row-reverse ms-14", "flex-row me-14"][messageDirection],
					className,
				)}
			>
				{showPhoto && (
					<User.Photo
						variant="default"
						user={user}
						className={"sticky top-20"} // TODO: 重构，不应该在这里 sticky
					/>
				)}
				<div
					className={cn(
						"flex flex-col",
						["items-end", "items-start"][messageDirection],
					)}
				>
					{showUsername && (
						<User.Username
							variant="default"
							user={user}
							className={cn(
								"mt-px mb-[7px] mx-0.5 text-[13px] leading-[14px] text-neutral-500",
								"peer",
							)}
						/>
					)}
					<div
						className={cn(
							"flex flex-col gap-2",
							["items-end", "items-start"][messageDirection],
							"[&>*:nth-child(n+2).bubble-tail-l]:bubble-tail-none [&>*:nth-child(n+2).bubble-tail-r]:bubble-tail-none",
							"peer-has-[+div>div:nth-child(1)[data-red-envelope-decoration=true]]:-mt-[8.33333333%]",
							className,
						)}
						{...props}
					>
						{messages.map((message, index) => (
							<Message
								key={`(${index})${message.id}`}
								message={message}
								variant="default"
							/>
						))}
						{children}
					</div>
				</div>
			</div>
		</ErrorBoundary>
	);
}
