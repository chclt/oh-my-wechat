import type { AppMessageProps } from "@/components/message/app-message.tsx";
import TextPrettier from "@/components/text-prettier.tsx";
import User from "@/components/user.tsx";
import { UserListQueryOptions } from "@/lib/fetchers/user.ts";
import type { AppMessageType, AppMessageTypeEnum, ChatType } from "@/schema";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChatSuspenseQueryOptions } from "@/lib/fetchers/chat.ts";
import { Route } from "@/routes/$accountId/route.tsx";

export interface PatMessageEntity {
	type: AppMessageTypeEnum.PAT;
	title: string;
	patMsg: {
		records: {
			record: PatMessageRecord | PatMessageRecord[];
			recordNum: number;
		};
		chatUser: string;
	};
}

interface PatMessageRecord {
	svrId: string;
	pattedUser: string;
	templete: string;
	fromUser: string;
	createTime: number;
}

type PatMessageProps = AppMessageProps<PatMessageEntity>;

export default function PatMessage({
	message,
	variant = "default",
	...props
}: PatMessageProps) {
	if (variant === "default") {
		return <PatMessageDefault message={message} {...props} />;
	} else if (variant === "abstract") {
		return <PatMessageAbstract message={message} {...props} />;
	}
}

function PatMessageDefault({
	message,
	...props
}: Omit<PatMessageProps, "variant">) {
	const { accountId } = Route.useParams();
	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, message.chat_id),
	);

	const records = useContentParser(message, chat);

	return (
		<>
			{records.map((record, index) => (
				<div
					key={index}
					className={
						"mx-auto px-14 text-sm text-center text-pretty text-neutral-600"
					}
					{...props}
				>
					<p>{...record}</p>
				</div>
			))}
		</>
	);
}

function PatMessageAbstract({
	message,
	...props
}: Omit<PatMessageProps, "variant">) {
	const { accountId } = Route.useParams();
	const { data: chat } = useSuspenseQuery(
		ChatSuspenseQueryOptions(accountId, message.chat_id),
	);

	const records = useContentParser(message, chat);

	const lastRecord = records.at(-1);

	if (!lastRecord) return null;

	return <p>{...lastRecord}</p>;
}

function useContentParser(
	message: AppMessageType<PatMessageEntity>,
	chat: ChatType,
) {
	// 在用户退群的情况下，chat信息中可能缺少用户信息，需额外查询
	const [missingUserIds, setMissingUserIds] = useState<string[]>([]);

	const { data: foundMissingUser = [] } = useQuery({
		...UserListQueryOptions(missingUserIds),
		enabled: missingUserIds.length > 0,
	});

	const records = (
		Array.isArray(message.message_entity.msg.appmsg.patMsg.records.record)
			? message.message_entity.msg.appmsg.patMsg.records.record
			: [message.message_entity.msg.appmsg.patMsg.records.record]
	).map((record) => {
		const regex = new RegExp(
			`((?:\\\${${record.fromUser}(?:@textstatusicon)?})|(?:\\\${${record.pattedUser}(?:@textstatusicon)?}))`,
			"g",
		);

		const segments = record.templete.split(regex).map((s, index) => {
			if (!s) return null;
			if (new RegExp(`^\\\${${record.fromUser}}$`).test(s)) {
				const user =
					chat?.members.find((member) => member.id === record.fromUser) ??
					foundMissingUser.find((user) => user.id === record.fromUser);

				if (user) {
					return <User user={user} variant={"inline"} />;
				}
				setMissingUserIds((prev) => [...prev, record.fromUser]);
				return record.fromUser;
			}

			if (new RegExp(`^\\\${${record.fromUser}@textstatusicon}$`).test(s))
				return null; // statusicon

			if (new RegExp(`^\\\${${record.pattedUser}}$`).test(s)) {
				const user =
					chat?.members.find((member) => member.id === record.pattedUser) ??
					foundMissingUser.find((user) => user.id === record.pattedUser);

				if (user) {
					return <User user={user} variant={"inline"} />;
				}
				setMissingUserIds((prev) => [...prev, record.pattedUser]);
				return record.pattedUser;
			}

			if (new RegExp(`^\\\${${record.pattedUser}@textstatusicon}$`).test(s))
				return null; // statusicon

			return <TextPrettier key={index} text={s} inline />;
		});

		return segments;
	});

	return records;
}
