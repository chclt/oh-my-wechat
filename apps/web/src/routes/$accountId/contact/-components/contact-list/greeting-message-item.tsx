import { MessageDirection, VerityMessageType } from "@repo/types";
import { Link } from "@tanstack/react-router";
import { ArrowUpRightIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar.tsx";
import { Route } from "@/routes/$accountId/route.tsx";

interface GreetingMessageItemProps extends React.HTMLAttributes<HTMLLIElement> {
	message: VerityMessageType;
}

export default function GreetingMessageItem({
	message,

	...props
}: GreetingMessageItemProps) {
	const { accountId } = Route.useParams();
	const userInfo = message.contact;

	const content = (
		<>
			<Avatar
				className={"shrink-0"}
				src={
					userInfo?.photo?.thumb ??
					message.message_entity.msg["@_smallheadimgurl"]
				}
			/>

			<div className="grow">
				<div className="flex justify-between">
					<h4 className="font-medium">
						{userInfo?.remark ??
							userInfo?.username ??
							message.message_entity.msg["@_fromnickname"]}
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
		</>
	);

	return (
		<li {...props}>
			{userInfo ? (
				<Link
					to="/$accountId/chat/$chatId"
					params={{ accountId, chatId: userInfo.id }}
					className="p-4 flex gap-4 hover:bg-muted"
				>
					{content}
				</Link>
			) : (
				<div className="p-4 flex gap-4">{content}</div>
			)}
		</li>
	);
}
