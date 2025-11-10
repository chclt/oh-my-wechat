import { MessageDirection, VerityMessageType } from "@/schema";
import { Link } from "@tanstack/react-router";
import { Route } from "@/routes/$accountId/route.tsx";
import { Avatar } from "@/components/ui/avatar.tsx";
import { ArrowUpRightIcon } from "lucide-react";
import { useInViewport, useMergedRef } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { ImageSuspenseQueryOptions } from "@/lib/fetchers";
import { UserSuspenseQueryOptions } from "@/lib/fetchers/user.ts";
import { userInfo } from "node:os";

interface GreetingMessageItemProps extends React.HTMLAttributes<HTMLLIElement> {
	message: VerityMessageType;
}

export default function GreetingMessageItem({
	message,

	...props
}: GreetingMessageItemProps) {
	const { ref, inViewport } = useInViewport();

	const { accountId } = Route.useParams();

	// fromusername 也许是一个编码过的字符串，因为微信号最大20，所以以此判断是否是经编码的微信号
	// fullpy 看字面意思是全拼的意思，但是实际发现很多时候是是微信号，暂时没有更准确的数据
	// 把 fullpy 当作微信号依然可能查不到用户
	let userId =
		message.message_entity.msg["@_fromusername"].length > 20
			? message.message_entity.msg["@_fullpy"]
			: message.message_entity.msg["@_fromusername"];

	const { data: userInfo, isFetching } = useQuery({
		...UserSuspenseQueryOptions(accountId, userId),
		enabled: inViewport,
	});

	return (
		<li ref={ref} {...props}>
			<Link
				to="/$accountId/chat/$chatId"
				params={{
					accountId,
					chatId: userId,
				}}
				className={"p-4 flex gap-4 hover:bg-muted"}
			>
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
			</Link>
		</li>
	);
}
