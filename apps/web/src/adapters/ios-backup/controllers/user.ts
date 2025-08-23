import type { DataAdapterResponse } from "@/adapters/adapter";
import { adapterWorker } from "../worker";
import type { ChatroomType, ContactType, UserType } from "@/schema";
import type { WCDatabases } from "../types";
import {
	friendTable,
	friendTableSelect,
	friendTableSelectInfer,
	openIMContactTable,
	openIMContactTableSelect,
	openIMContactTableSelectInfer,
} from "../database/contact";
import { and, inArray, notLike, sql } from "drizzle-orm";
import { unionAll } from "drizzle-orm/sqlite-core";

async function parseContactDatabaseFriendTableRows(
	rows: friendTableSelectInfer | openIMContactTableSelectInfer,
	{ databases }: { databases: WCDatabases },
): Promise<(UserType | ChatroomType)[]> {
	const allMemberIds: string[] = [];

	const resultWithoutMembers = rows.map((row) => {
		if (row.username.endsWith("@chatroom")) {
			let memberIds: string[] = [];

			if (row?.dbContactChatRoom) {
				memberIds = row.dbContactChatRoom.chatroomMemberIds.split(";");
				allMemberIds.push(...memberIds);
			}

			return {
				id: row.username,
				title: row.dbContactRemark.nickname
					? row.dbContactRemark.nickname
					: "群聊",
				...(row.dbContactRemark.remark
					? {
							remark: row.dbContactRemark.remark,
						}
					: {}),
				...(row.dbContactHeadImage.headImageThumb
					? {
							photo: {
								thumb: row.dbContactHeadImage.headImageThumb,
							},
						}
					: {}),
				is_openim: !!row.dbContactOpenIM,

				_is_pinned: !!((row.type >> 11) & 1),
				_is_collapsed: !!((row.type >> 28) & 1),
				_member_ids: memberIds,

				...(import.meta.env.DEV
					? {
							__dev: {
								database_row: row,
							},
						}
					: {}),
			} as Omit<ChatroomType, "members"> & {
				_is_pinned: boolean;
				_is_collapsed: boolean;
				_member_ids: string[];
			};
		} else {
			return {
				id: row.username,
				user_id: row.dbContactRemark.id,
				username: row.dbContactRemark.nickname ?? "",
				...(row.dbContactRemark.remark
					? {
							remark: row.dbContactRemark.remark,
						}
					: {}),
				bio: row.dbContactProfile.profileBio,

				...(row.dbContactHeadImage.headImageThumb
					? {
							photo: {
								thumb: row.dbContactHeadImage.headImageThumb,
							},
						}
					: {}),

				background: row.dbContactSocial.socialBackground,

				...(row.dbContactSocial.socialPhone
					? {
							phone: row.dbContactSocial.socialPhone,
						}
					: {}),
				is_openim: !!row.dbContactOpenIM,

				// @ts-ignore
				_is_pinned: !!((row.type >> 11) & 1),

				...(import.meta.env.DEV
					? {
							__dev: {
								database_row: row,
							},
						}
					: {}),
			} satisfies UserType;
		}
	});

	const allMembers: UserType[] = (
		await findAll(
			{
				ids: Array.from(new Set(allMemberIds)),
			},
			{ databases },
		)
	).data as UserType[];

	// 加入当前登录的微信账号数据 TODO:其实感觉应该有别的方法判断自己在不在这个群里
	if (
		adapterWorker._getStoreItem("account") &&
		allMemberIds.indexOf(adapterWorker._getStoreItem("account").id) > -1
	) {
		allMembers.push(adapterWorker._getStoreItem("account"));
	}

	const allMembersTable: { [key: string]: UserType } = {};
	for (const member of allMembers) {
		allMembersTable[member.id] = member;
	}

	const result: (UserType | ChatroomType)[] = resultWithoutMembers.map(
		(item) => {
			if (item.id.endsWith("@chatroom")) {
				// @ts-ignore
				item.members = (item as Omit<ChatroomType, "members">)._member_ids
					.map((memberId: string) => allMembersTable[memberId])
					.filter((member: UserType) => member);

				return item as unknown as ChatroomType;
			}

			return item as UserType;
		},
	);

	return result;
}

export type AllInput = [{ databases: WCDatabases }];
export type AllOutput = Promise<
	DataAdapterResponse<(UserType | ChatroomType)[]>
>;

export async function all(...inputs: AllInput): AllOutput {
	const [{ databases }] = inputs;

	const db = databases.WCDB_Contact;
	if (!db) {
		throw new Error("WCDB_Contact database is not found");
	}

	const rows = unionAll(
		db
			.select(friendTableSelect)
			.from(friendTable)
			.where(
				and(
					notLike(friendTable.username, "gh_%"),
					sql`(${friendTable.type} & 1) != 0`,
				),
			),
		db
			.select(openIMContactTableSelect)
			.from(openIMContactTable)
			.where(
				and(
					notLike(openIMContactTable.username, "gh_%"),
					sql`(${openIMContactTable.type} & 1) != 0`,
				),
			),
	).all();

	return {
		data: await parseContactDatabaseFriendTableRows(rows, { databases }),
	};
}

export type FindAllInput = [{ ids: string[] }, { databases: WCDatabases }];
export type FinfAllOutput = Promise<
	DataAdapterResponse<(UserType | ChatroomType)[]>
>;

export async function findAll(...inputs: FindAllInput): FinfAllOutput {
	const [{ ids }, { databases }] = inputs;

	const db = databases.WCDB_Contact;
	if (!db) {
		throw new Error("WCDB_Contact database is not found");
	}

	if (ids.length === 0) return { data: [] };

	// 现在用 IN 查询，但是可能会出现 SQL 语句过长的问题，暂时不知道限制是多少

	const rows = unionAll(
		db
			.select(friendTableSelect)
			.from(friendTable)
			.where(inArray(friendTable.username, ids)),
		db
			.select(openIMContactTableSelect)
			.from(openIMContactTable)
			.where(inArray(openIMContactTable.username, ids)),
	).all();

	return {
		data: [
			...(ids.indexOf(adapterWorker._getStoreItem("account").id) > -1
				? [adapterWorker._getStoreItem("account") as UserType]
				: []),
			...(await parseContactDatabaseFriendTableRows(rows, { databases })),
		],
	};
}

/**
 * TODO: 上面的都可以重构了。。
 */

export type ContactListInput = [{ databases: WCDatabases }];
export type ContactListOutput = Promise<DataAdapterResponse<ContactType[]>>;

export async function contactList(
	...inputs: ContactListInput
): ContactListOutput {
	const [{ databases }] = inputs;

	const db = databases.WCDB_Contact;
	if (!db) {
		throw new Error("WCDB_Contact database is not found");
	}

	const rows = unionAll(
		db
			.select(friendTableSelect)
			.from(friendTable)
			.where(sql`(${friendTable.type} & 1) != 0`),
		db
			.select(openIMContactTableSelect)
			.from(openIMContactTable)
			.where(sql`(${openIMContactTable.type} & 1) != 0`),
	).all();

	const result = rows.map((row) => {
		return {
			id: row.username,
			username: row.dbContactRemark.nickname ?? "",
			usernamePinyin: row.dbContactRemark.nicknamePinyin ?? "",

			...(row.dbContactRemark.remark
				? {
						remark: row.dbContactRemark.remark,
					}
				: {}),

			...(row.dbContactRemark.remarkPinyin
				? {
						remarkPinyin: row.dbContactRemark.remarkPinyin,
					}
				: {}),

			...(row.dbContactRemark.remarkPinyinInits
				? {
						remarkPinyinInits: row.dbContactRemark.remarkPinyinInits,
					}
				: {}),

			...(row.dbContactHeadImage.headImageThumb
				? {
						photo: {
							thumb: row.dbContactHeadImage.headImageThumb,
						},
					}
				: {}),
			is_openim: !!row.dbContactOpenIM,

			...(import.meta.env.DEV
				? {
						__dev: {
							database_row: row,
						},
					}
				: {}),
		} satisfies ContactType;
	});

	return {
		data: result,
	};
}
