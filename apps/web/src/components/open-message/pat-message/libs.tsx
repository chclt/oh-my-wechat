import type { ChatType, OpenMessageType } from "@repo/types";
import { PatOpenMessageEntity } from "@repo/types";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@/components/account-provider.tsx";
import TextPrettier from "@/components/text-prettier.tsx";
import User from "@/components/user.tsx";
import { UserListQueryOptions } from "@/lib/fetchers/user.ts";

export function useContentParser(
	message: OpenMessageType<PatOpenMessageEntity>,
	chat: ChatType,
	formatLink = true,
) {
	const { accountId } = useAccount();
	const records = Array.isArray(
		message.message_entity.msg.appmsg.patMsg.records.record,
	)
		? message.message_entity.msg.appmsg.patMsg.records.record
		: [message.message_entity.msg.appmsg.patMsg.records.record];

	// 在用户退群的情况下，chat信息中可能缺少用户信息，需额外查询
	const missingUserIds = Array.from(
		new Set(records.flatMap((record) => [record.fromUser, record.pattedUser])),
	).filter((id) => !chat.members.some((member) => member.id === id));

	const { data: foundMissingUser = [] } = useQuery({
		...UserListQueryOptions(accountId, missingUserIds),
		enabled: missingUserIds.length > 0,
	});

	return records.map((record) => {
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
					return <User key={index} user={user} variant={"inline"} />;
				}
				return record.fromUser;
			}

			if (new RegExp(`^\\\${${record.fromUser}@textstatusicon}$`).test(s))
				return null; // statusicon

			if (new RegExp(`^\\\${${record.pattedUser}}$`).test(s)) {
				const user =
					chat?.members.find((member) => member.id === record.pattedUser) ??
					foundMissingUser.find((user) => user.id === record.pattedUser);

				if (user) {
					return <User key={index} user={user} variant={"inline"} />;
				}
				return record.pattedUser;
			}

			if (new RegExp(`^\\\${${record.pattedUser}@textstatusicon}$`).test(s))
				return null; // statusicon

			return (
				<TextPrettier key={index} text={s} inline formatLink={formatLink} />
			);
		});

		return segments;
	});
}
