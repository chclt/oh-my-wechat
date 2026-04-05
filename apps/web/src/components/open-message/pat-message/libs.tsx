import TextPrettier from "@/components/text-prettier.tsx";
import User from "@/components/user.tsx";
import { UserListQueryOptions } from "@/lib/fetchers/user.ts";
import type { ChatType, OpenMessageType } from "@/schema";
import { PatOpenMessageEntity } from "@/schema/open-message.ts";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function useContentParser(
	message: OpenMessageType<PatOpenMessageEntity>,
	chat: ChatType,
	accountId: string,
) {
	// 在用户退群的情况下，chat信息中可能缺少用户信息，需额外查询
	const [missingUserIds, setMissingUserIds] = useState<string[]>([]);

	const { data: foundMissingUser = [] } = useQuery({
		...UserListQueryOptions(accountId, missingUserIds),
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
