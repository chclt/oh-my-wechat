import { MessageDirection, VerityMessageType } from "@/schema";
import { Link } from "@tanstack/react-router";
import { Route } from "@/routes/$accountId/route.tsx";
import { Avatar } from "@/components/ui/avatar.tsx";
import { ArrowUpRightIcon } from "lucide-react";

interface GreetingMessageItemProps extends React.HTMLAttributes<HTMLLIElement> {
	message: VerityMessageType;
}

export default function GreetingMessageItem({
	message,

	...props
}: GreetingMessageItemProps) {
	const { accountId } = Route.useParams();

	let fromUserId =
		message.message_entity.msg["@_fromusername"].length > 30
			? message.message_entity.msg["@_fullpy"]
			: message.message_entity.msg["@_fromusername"];

	return (
		<li {...props}>
			<Link
				to="/$accountId/chat/$chatId"
				params={{
					accountId,
					chatId: fromUserId,
				}}
				className={"p-4 flex gap-4 hover:bg-muted"}
			>
				<Avatar
					className={"shrink-0"}
					src={message.message_entity.msg["@_smallheadimgurl"]}
				/>

				<div className="grow">
					<div className="flex justify-between">
						<h4 className="font-medium">
							{message.message_entity.msg["@_fromnickname"]}
						</h4>
						<small className="text-neutral-400">
							{message.direction === MessageDirection.outgoing && (
								<ArrowUpRightIcon size={16} />
							)}
						</small>
					</div>
					<p className="text-sm text-muted-foreground">
						{message.direction === MessageDirection.outgoing && "我: "}
						{message.message_entity.msg["@_content"]}
					</p>
				</div>
			</Link>
		</li>
	);
}
