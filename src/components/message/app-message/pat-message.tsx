import type { AppMessageProps } from "@/components/message/app-message.tsx";
import { FormatTextMessageContent } from "@/components/message/text-message.tsx";
import User from "@/components/user.tsx";
import type { AppMessageTypeEnum, UserType } from "@/schema";
import { useEffect, useRef, useState } from "react";

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

export default function PatMessage({ message, ...props }: PatMessageProps) {
	const chat = message.chat;
	// 在用户退群的情况下，chat信息中可能缺少用户信息，需额外查询
	const queryFlag = useRef(false);

	// const [query, isQuerying, result, error] = useQuery<
	//   ControllerResult<UserType[]>
	// >({ data: [] });

	const result = {
		data: [],
	};

	const missingUserIds = useRef<string[]>([]);
	const [missingUser, setMissingUser] = useState<UserType[]>([]);

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
					missingUser.find((user) => user.id === record.fromUser);

				if (user) {
					return <User user={user} variant={"inline"} />;
				}
				missingUserIds.current.push(record.fromUser);
				return record.fromUser;
			}

			if (new RegExp(`^\\\${${record.fromUser}@textstatusicon}$`).test(s))
				return null; // statusicon

			if (new RegExp(`^\\\${${record.pattedUser}}$`).test(s)) {
				const user =
					chat?.members.find((member) => member.id === record.pattedUser) ??
					missingUser.find((user) => user.id === record.pattedUser);

				if (user) {
					return <User user={user} variant={"inline"} />;
				}
				missingUserIds.current.push(record.pattedUser);
				return record.pattedUser;
			}

			if (new RegExp(`^\\\${${record.pattedUser}@textstatusicon}$`).test(s))
				return null; // statusicon

			return (
				<FormatTextMessageContent key={index} text={s} variant={"inline"} />
			);
		});

		return segments;
	});

	if (!queryFlag.current) {
		queryFlag.current = true;

		//TODO
		// query("/contacts/in", { ids: missingUserIds.current });
	}

	useEffect(() => {
		setMissingUser(result.data);
	}, [result]);

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
