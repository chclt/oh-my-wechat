import User from "@/components/user.tsx";
import { MessageDirection, type UserType } from "@/lib/schema.ts";
import type { MessageType } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import { ErrorBoundary } from "react-error-boundary";
import Message from "./message/message.tsx";

interface BubbleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	user: UserType;
	messages?: MessageType[];

	showPhoto?: boolean;
	showUsername?: boolean;
}

export function MessageBubbleGroup({
	user,
	messages = [],
	showPhoto = true,
	showUsername = false,

	className,
	children,
	...props
}: BubbleGroupProps) {
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
						className={"sticky top-20"}
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
							className={
								"mt-px mb-[7px] mx-0.5 text-[13px] leading-[14px] text-neutral-500"
							}
						/>
					)}
					<div
						className={cn(
							"flex flex-col gap-2",
							["items-end", "items-start"][messageDirection],
							"[&>*:nth-child(n+2).bubble-tail-l]:bubble-tail-none [&>*:nth-child(n+2).bubble-tail-r]:bubble-tail-none",
							className,
						)}
						{...props}
					>
						{messages.map((message, index) => (
							<Message key={`(${index})${message.id}`} message={message} />
						))}
						{children}
					</div>
				</div>
			</div>
		</ErrorBoundary>
	);
}
