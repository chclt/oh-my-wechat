import { DataAdapterResponse } from "@/adapters/adapter";
import { _store } from "../worker";
import type {
	ChatroomType,
	DatabaseFriendRow,
	UserType,
	WCDatabases,
} from "@/schema";
import protobuf from "protobufjs";

const dbContactProtos = {
	dbContactRemark: {
		nickname: {
			type: "string",
			id: 1,
		},
		id: {
			type: "string",
			id: 2,
		},
		remark: {
			type: "string",
			id: 3,
		},
		remarkPinyin: {
			type: "string",
			id: 4,
		},
		remarkPinyinInits: {
			type: "string",
			id: 5,
		},
		nicknamePinyin: {
			type: "string",
			id: 6,
		},
		remarkField7: {
			type: "string",
			id: 7,
		},
		remarkField8: {
			type: "string",
			id: 8,
		},
	},
	dbContactHeadImage: {
		headImageFlag: {
			type: "int32",
			id: 1,
		},
		headImageThumb: {
			type: "string",
			id: 2,
		},
		headImage: {
			type: "string",
			id: 3,
		},
		headImageField4: {
			type: "string",
			id: 4,
		},
	},
	dbContactProfile: {
		profileFlag: {
			type: "int32",
			id: 1,
		},
		profileCountry: {
			type: "string",
			id: 2,
		},
		profileProvince: {
			type: "string",
			id: 3,
		},
		profileCity: {
			type: "string",
			id: 4,
		},
		profileBio: {
			type: "string",
			id: 5,
		},
	},
	dbContactSocial: {
		// socialField1: {
		//   type: "string",
		//   id: 1,
		// },
		// socialField2: {
		//   type: "string",
		//   id: 2,
		// },
		// socialField3: {
		//   type: "int32",
		//   id: 3,
		// },
		// socialField7: {
		//   type: "int32",
		//   id: 7,
		// },

		// socialField8: {
		//   type: "int32",
		//   id: 8,
		// },
		socialBackground: {
			type: "string",
			id: 9,
		},
		// socialField10: {
		//   type: "string",
		//   id: 10,
		// },
		socialPhone: {
			type: "string",
			id: 11,
		},
		// socialField12: {
		//   type: "string",
		//   id: 12,
		// },
	},
	dbContactChatRoom: {
		chatroomMemberIds: {
			type: "string",
			id: 1,
		},
		chatroomOwnerIds: {
			type: "string",
			id: 2,
		},
		chatroomaMaxCount: {
			type: "uint32",
			id: 4,
		},
		chatroomVersion: {
			type: "uint32",
			id: 5,
		},
		chatroomMember: {
			type: "string", // xml
			id: 6,
		},
	},
	dbContactOpenIM: {
		openIMContactInfo: {
			type: "string", // json
			id: 1,
		},
		openIMContactId: {
			type: "string",
			id: 2,
		},
	},
};
const dbContactProtobufRoot = protobuf.Root.fromJSON({
	nested: {
		ContactRemark: {
			fields: dbContactProtos.dbContactRemark,
		},
		HeadImage: {
			fields: dbContactProtos.dbContactHeadImage,
		},
		Profile: {
			fields: dbContactProtos.dbContactProfile,
		},
		Social: {
			fields: dbContactProtos.dbContactSocial,
		},
		Chatroom: {
			fields: dbContactProtos.dbContactChatRoom,
		},
		OpenIM: {
			fields: dbContactProtos.dbContactOpenIM,
		},
	},
});

export namespace ContactController {
	async function parseDatabaseContactRows(
		databases: WCDatabases,
		raw_contact_rows: DatabaseFriendRow[],
	): Promise<(UserType | ChatroomType)[]> {
		const allMemberIds: string[] = [];

		const resultWithoutMembers = raw_contact_rows.map((row) => {
			// @ts-ignore
			const remarkObj: { [key: string]: unknown } = dbContactProtobufRoot
				.lookupType("ContactRemark")
				.decode(row.dbContactRemark);
			// @ts-ignore
			const headImageObj: { [key: string]: unknown } = dbContactProtobufRoot
				.lookupType("HeadImage")
				.decode(row.dbContactHeadImage);
			// @ts-ignore
			const profileObj: { [key: string]: unknown } = dbContactProtobufRoot
				.lookupType("Profile")
				.decode(row.dbContactProfile);
			// @ts-ignore
			const socialObj: { [key: string]: unknown } = dbContactProtobufRoot
				.lookupType("Social")
				.decode(row.dbContactSocial);
			// @ts-ignore
			const chatroomObj: { [key: string]: unknown } | undefined =
				row.dbContactChatRoom
					? dbContactProtobufRoot
							.lookupType("Chatroom")
							.decode(row.dbContactChatRoom)
					: undefined;
			// @ts-ignore
			const openIMObj: { [key: string]: unknown } | undefined =
				row.dbContactOpenIM
					? dbContactProtobufRoot
							.lookupType("OpenIM")
							.decode(row.dbContactOpenIM)
					: undefined;

			if (openIMObj?.openIMContactInfo) {
				openIMObj.openIMContactInfo = JSON.parse(
					openIMObj.openIMContactInfo as string,
				);
			}

			const specialUser = [
				{
					id: "brandsessionholder",
					username: "订阅号消息",
				},
				{
					id: "notification_messages",
					username: "服务消息",
				},
				{
					id: "brandsessionholder_weapp",
					username: "小程序客服消息",
				},
				{
					id: "opencustomerservicemsg",
					username: "小程序客服消息",
				},
				{ id: "chatroom_session_box", username: "折叠的群聊" },
			];

			if (row.userName.endsWith("@chatroom")) {
				let memberIds: string[] = [];

				if (chatroomObj?.chatroomMemberIds) {
					memberIds = (chatroomObj.chatroomMemberIds as string).split(";");
					allMemberIds.push(...memberIds);
				}

				return {
					id: row.userName,
					title: (remarkObj.nickname as string).length
						? remarkObj.nickname
						: "群聊",
					...((remarkObj.remark as string).length
						? {
								remark: remarkObj.remark,
							}
						: {}),
					...(headImageObj.headImageThumb
						? {
								photo: {
									thumb: headImageObj.headImageThumb,
								},
							}
						: {}),
					is_openim: !!openIMObj,

					_is_pinned: !!((row.type >> 11) & 1),
					_is_collapsed: !!((row.type >> 28) & 1),
					_member_ids: memberIds,

					raw: {
						...row,
						...remarkObj,
						...headImageObj,
						...profileObj,
						...socialObj,
						...chatroomObj,
						...openIMObj,
					},
				} as Omit<ChatroomType, "members"> & {
					_is_pinned: boolean;
					_is_collapsed: boolean;
					_member_ids: string[];
				};
			}

			return {
				id: row.userName,
				user_id: remarkObj.id,
				username: remarkObj.nickname,
				...((remarkObj.remark as string).length
					? {
							remark: remarkObj.remark,
						}
					: {}),
				bio: profileObj.profileBio,

				...(headImageObj.headImageThumb
					? {
							photo: {
								thumb: headImageObj.headImageThumb,
							},
						}
					: {}),

				background: socialObj.socialBackground,

				...(socialObj.phone
					? {
							phone: socialObj.phone,
						}
					: {}),
				is_openim: !!openIMObj,

				_is_pinned: !!((row.type >> 11) & 1),

				raw: {
					...row,
					...remarkObj,
					...headImageObj,
					...profileObj,
					...socialObj,
					...openIMObj,
				},
			} as UserType;
		});

		const allMembers: UserType[] = (
			await ContactController.findAll(
				{
					ids: Array.from(new Set(allMemberIds)),
				},
				{ databases },
			)
		).data as UserType[];

		// 加入当前登录的微信账号数据
		if (_store.account && allMemberIds.indexOf(_store.account.id) > -1) {
			allMembers.push(_store.account);
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

		const dbFriendRows: DatabaseFriendRow[] = db
			.exec(
				`
          SELECT rowid, userName, dbContactRemark, dbContactChatRoom, dbContactHeadImage, dbContactProfile, dbContactSocial, dbContactOpenIM, type FROM Friend WHERE (type & 1) != 0
          UNION  ALL
          SELECT rowid, userName, dbContactRemark, dbContactChatRoom, dbContactHeadImage, dbContactProfile, dbContactSocial, dbContactOpenIM, type FROM OpenIMContact WHERE (type & 1) != 0
        `,
			)[0]
			.values.reduce((acc, cur) => {
				acc.push({
					rowid: cur[0],
					userName: cur[1],
					dbContactRemark: cur[2],
					dbContactChatRoom: cur[3],
					dbContactHeadImage: cur[4],
					dbContactProfile: cur[5],
					dbContactSocial: cur[6],
					dbContactOpenIM: cur[7],
					type: cur[8],
				} as DatabaseFriendRow);
				return acc;
			}, [] as DatabaseFriendRow[]);

		return {
			data: await parseDatabaseContactRows(
				databases,
				dbFriendRows.filter((row) => {
					if (row.userName.startsWith("gh_")) return false;
					return true;
				}),
			),
		};
	}

	export type FindAllInput = [{ ids: string[] }, { databases: WCDatabases }];
	export type FinfAllOutput = Promise<
		DataAdapterResponse<(UserType | ChatroomType)[]>
	>;

	export async function findAll(...inputs: FindAllInput): FinfAllOutput {
		const [{ ids }, { databases }] = inputs;

		// 考虑到批量获取联系人可能很多，如果用 IN 查询，可能会导致 SQL 语句过长

		const db = databases.WCDB_Contact;
		if (!db) {
			throw new Error("WCDB_Contact database is not found");
		}

		if (ids.length === 0) return { data: [] };

		const dbFriendRows: DatabaseFriendRow[] = db
			.exec(
				`
          SELECT rowid, userName, dbContactRemark, dbContactChatRoom, dbContactHeadImage, dbContactProfile, dbContactSocial, dbContactOpenIM, type FROM Friend
          UNION ALL
          SELECT rowid, userName, dbContactRemark, dbContactChatRoom, dbContactHeadImage, dbContactProfile, dbContactSocial, dbContactOpenIM, type FROM OpenIMContact
        `,
			)[0]
			.values.reduce((acc, cur) => {
				acc.push({
					rowid: cur[0],
					userName: cur[1],
					dbContactRemark: cur[2],
					dbContactChatRoom: cur[3],
					dbContactHeadImage: cur[4],
					dbContactProfile: cur[5],
					dbContactSocial: cur[6],
					dbContactOpenIM: cur[7],
					type: cur[8],
				} as DatabaseFriendRow);
				return acc;
			}, [] as DatabaseFriendRow[]);

		return {
			data: [
				...(ids.indexOf(_store.account.id) > -1
					? [_store.account as UserType]
					: []),
				...(await parseDatabaseContactRows(
					databases,
					dbFriendRows.filter((row) => {
						if (ids.includes(row.userName)) return true;
						return false;
					}),
				)),
			],
		};
	}
}
