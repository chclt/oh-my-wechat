import {
	BasicMessageType,
	type ChatroomVoipMessageEntity,
	type ChatroomVoipMessageType,
	type ChatType,
	type ContactMessageEntity,
	type ContactMessageType,
	type ImageMessageEntity,
	type ImageMessageType,
	type LocationMessageEntity,
	type LocationMessageType,
	type MailMessageEntity,
	type MailMessageType,
	MessageDirection,
	type MessageType,
	MessageTypeEnum,
	type MicroVideoMessageEntity,
	type MicroVideoMessageType,
	type OpenMessageEntity,
	type OpenMessageType,
	OpenMessageTypeEnum,
	ReferOpenMessageEntity,
	type StickerMessageEntity,
	type StickerMessageType,
	type SystemExtendedMessageEntity,
	type SystemExtendedMessageType,
	type SystemMessageEntity,
	type SystemMessageType,
	type TextMessageType,
	type UserType,
	type VerityMessageEntity,
	type VerityMessageType,
	type VideoMessageEntity,
	type VideoMessageType,
	type VoiceMessageEntity,
	type VoiceMessageType,
	type VoipMessageEntity,
	type VoipMessageType,
	type WeComContactMessageEntity,
	type WeComContactMessageType,
} from "@repo/types";
import type {
	DataAdapterCursorPagination,
	DataAdapterResponse,
	GetGreetingMessageListRequest,
	GetGreetingMessageListResponse,
	GetMessageListRequest,
	MessageListCursor,
} from "@repo/types/adapter";
import CryptoJS from "crypto-js";
import {
	and,
	asc,
	desc,
	eq,
	gt,
	gte,
	inArray,
	like,
	lt,
	lte,
	or,
	sql,
	type SQL,
} from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";
import {
	chatTableSelect,
	ChatTableSelectInfer,
	getChatTable,
	getHelloTable,
	helloTableSelect,
	HelloTableSelectInfer,
} from "../database/message.ts";
import type { WCDatabases } from "../types.ts";
import WCDB, {
	WCDBDatabaseSeriesName,
	WCDBTableSeriesName,
} from "../utils/wcdb.ts";
import * as ChatController from "./chat.ts";
import * as UserController from "./user.ts";

export function fallbackUnsupportedMessageQueryRows<
	DataType extends Record<string, unknown>[],
>({ result, errors }: { result: DataType; errors: { rowIndex: number }[] }) {
	errors.forEach(({ rowIndex }) => {
		(result[rowIndex] as { Type: MessageTypeEnum }).Type =
			MessageTypeEnum.OMW_ERROR;
	});

	return result;
}

async function parseMessageDatabaseChatTableRows(
	rows: ChatTableSelectInfer[],
	{
		account,
		chat,
		databases,
		parseReplyMessage = true,
	}: {
		account: UserType;
		chat: ChatType;
		databases: WCDatabases;
		parseReplyMessage?: boolean;
	},
): Promise<MessageType[]> {
	const messageSenderIds = rows
		.map((raw_message_row) => {
			if ((raw_message_row.Message as unknown) === null) {
				raw_message_row.Message = "";
				raw_message_row.Type = 1;
				return chat.id ?? undefined;
			}

			// Message 字段依然可能因为压缩是二进制，在这里只好报错
			if (typeof (raw_message_row.Message as unknown) === "object") {
				raw_message_row.Message = new TextDecoder("utf-8").decode(
					new Uint8Array(
						Object.values(
							raw_message_row.Message as unknown as Record<string, number>,
						),
					),
				);
				raw_message_row.Type = MessageTypeEnum.OMW_ERROR;
			}

			if (chat && chat.type === "chatroom") {
				let senderId = "";
				let rawMessageContent = "";

				if (raw_message_row.Des === MessageDirection.outgoing) {
					rawMessageContent = raw_message_row.Message;
					senderId = account.id;
				} else if (
					raw_message_row.Type === MessageTypeEnum.SYSTEM ||
					raw_message_row.Message.startsWith("<") ||
					raw_message_row.Message.startsWith('"<')
				) {
					rawMessageContent = raw_message_row.Message;

					// 有一些消息在内部记录 from，TODO 转账中可能记录在内部的 receiver_username / payer_username，现在是在消息组件里去处理
					const xmlParser = new XMLParser({ ignoreAttributes: false });
					const messageXml = xmlParser.parse(raw_message_row.Message);

					if (
						messageXml?.msg?.fromusername &&
						typeof messageXml.msg.fromusername === "string"
					) {
						senderId = messageXml.msg.fromusername;
					} else {
						if (raw_message_row.Type === MessageTypeEnum.VIDEO) {
							senderId = (messageXml as VideoMessageEntity).msg.videomsg[
								"@_fromusername"
							];
						}
					}
				} else {
					const separatorPosition = raw_message_row.Message.indexOf(":\n");
					senderId = raw_message_row.Message.slice(0, separatorPosition);
					rawMessageContent = raw_message_row.Message.slice(
						separatorPosition + 2,
					);
				}

				raw_message_row.Message = rawMessageContent;

				return senderId;
			}

			if (chat && chat.type === "private") {
				return raw_message_row.Des === MessageDirection.incoming
					? chat.id
					: account.id;
			}
		})
		.filter((i) => i !== undefined);
	const usersArray = (
		await UserController.findAll(
			{ ids: messageSenderIds },
			{ account, databases },
		)
	).data as UserType[];
	const usersTable: Record<string, UserType> = {};
	usersArray.map((user) => {
		usersTable[user.id] = user;
	});

	const messageIndexesHasReplyMessage: number[] = [];
	const replyMessageIds: string[] = [];

	const messages = rows.map((raw_message_row, index) => {
		const message: Omit<
			BasicMessageType<unknown, unknown>,
			"message_entity"
		> = {
			id: raw_message_row.MesSvrID,
			local_id: raw_message_row.MesLocalID,
			type: raw_message_row.Type,
			date: raw_message_row.CreateTime,
			direction:
				// 有些消息比如通话记录的发消息的人，但是记录消息方向不是想要的，可能因为这算系统消息
				(messageSenderIds[index]
					? messageSenderIds[index] === account.id
						? MessageDirection.outgoing
						: MessageDirection.incoming
					: undefined) ?? raw_message_row.Des,
			from:
				usersTable[messageSenderIds[index]] ??
				(messageSenderIds[index].length > 0
					? {
							id: messageSenderIds[index],
							user_id: messageSenderIds[index],
							username: messageSenderIds[index],
							// 好像一些群聊成员不会出现在数据库中
						}
					: undefined), // 有一些系统消息没有 from
			chat_id: chat.id,

			// message_entity,
			// reply_to_message?: Message;
			raw_message: raw_message_row.Message,
		};

		const xmlParser = new XMLParser({
			ignoreAttributes: false,
			tagValueProcessor: (_, tagValue, jPath) => {
				if (jPath === "msg.appmsg.title" || jPath === "msg.appmsg.des") {
					return undefined; // 不解析
				}
				return tagValue; // 走默认的解析
			},
		});

		switch (raw_message_row.Type) {
			case MessageTypeEnum.TEXT: {
				return {
					...message,
					message_entity: raw_message_row.Message,
				} as TextMessageType;
			}

			case MessageTypeEnum.IMAGE: {
				const messageEntity: ImageMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);
				return {
					...message,
					message_entity: messageEntity,
				} as ImageMessageType;
			}

			case MessageTypeEnum.VOICE: {
				const messageEntity: VoiceMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);
				return {
					...message,
					message_entity: messageEntity,
				} as VoiceMessageType;
			}

			case MessageTypeEnum.MAIL: {
				const messageEntity: MailMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);
				return {
					...message,
					message_entity: messageEntity,
				} as MailMessageType;
			}

			case MessageTypeEnum.CONTACT: {
				const messageEntity: ContactMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);
				return {
					...message,
					message_entity: messageEntity,
				} as ContactMessageType;
			}

			case MessageTypeEnum.VIDEO: {
				const messageEntity: VideoMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);
				return {
					...message,
					message_entity: messageEntity,
				} as VideoMessageType;
			}

			case MessageTypeEnum.STICKER: {
				const messageEntity: StickerMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);
				return {
					...message,
					message_entity: messageEntity,
				} as StickerMessageType;
			}

			case MessageTypeEnum.LOCATION: {
				const messageEntity: LocationMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);

				return {
					...message,
					message_entity: messageEntity,
				} as LocationMessageType;
			}

			case MessageTypeEnum.APP: {
				const messageEntity: OpenMessageEntity<{ type: number }> =
					xmlParser.parse(raw_message_row.Message);

				try {
					if (messageEntity.msg.appmsg.type === OpenMessageTypeEnum.REFER) {
						messageIndexesHasReplyMessage.push(index);

						const replyMessageId = (
							messageEntity as OpenMessageEntity<ReferOpenMessageEntity>
						).msg.appmsg.refermsg.svrid;
						replyMessageIds.push(replyMessageId);
					}
				} catch (error) {
					//
				}

				return {
					...message,
					message_entity: messageEntity,
				} as OpenMessageType<ReferOpenMessageEntity>;
			}

			case MessageTypeEnum.VOIP: {
				const messageEntity: VoipMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);

				return {
					...message,
					message_entity: messageEntity,
				} as VoipMessageType;
			}

			case MessageTypeEnum.MICROVIDEO: {
				const messageEntity: MicroVideoMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);

				return {
					...message,
					message_entity: messageEntity,
				} as MicroVideoMessageType;
			}

			case MessageTypeEnum.GROUP_VOIP: {
				const messageEntity: ChatroomVoipMessageEntity = JSON.parse(
					raw_message_row.Message,
				);

				return {
					...message,
					message_entity: messageEntity,
				} as ChatroomVoipMessageType;
			}

			case MessageTypeEnum.WECOM_CONTACT: {
				const messageEntity: WeComContactMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);

				return {
					...message,
					message_entity: messageEntity,
				} as WeComContactMessageType;
			}

			case MessageTypeEnum.SYSTEM: {
				const messageEntity: SystemMessageEntity = raw_message_row.Message;

				return {
					...message,
					message_entity: messageEntity,
				} as SystemMessageType;
			}

			case MessageTypeEnum.SYSTEM_EXTENDED: {
				const messageEntity: SystemExtendedMessageEntity = xmlParser.parse(
					raw_message_row.Message,
				);

				return {
					...message,
					message_entity: messageEntity,
				} as SystemExtendedMessageType;
			}

			default: {
				const messageEntity: string = `不支持: ${raw_message_row.Message}`;

				return {
					...message,
					message_entity: messageEntity,
				};
			}
		}
	});
	let replyMessageArray: MessageType[] = [];

	if (parseReplyMessage && chat && replyMessageIds.length) {
		replyMessageArray = (
			await find(
				{
					chat,
					messageIds: replyMessageIds,
				},
				{ account, databases },
			)
		).data;

		const replyMessageTable: { [key: string]: MessageType } = {};
		replyMessageArray.map((message) => {
			replyMessageTable[message.id] = message;
		});

		for (const index of messageIndexesHasReplyMessage) {
			messages[index].reply_to_message =
				replyMessageTable[
					(
						messages[index]
							.message_entity as OpenMessageEntity<ReferOpenMessageEntity>
					).msg.appmsg.refermsg.svrid
				];
		}
	}

	return messages as MessageType[];
}

function encodeCursor(
	row: ChatTableSelectInfer,
	condition: MessageListCursor["condition"],
): string {
	return JSON.stringify({
		condition,
		value: row.CreateTime,
		messageLocalId: row.MesLocalID,
	} satisfies MessageListCursor);
}

export type AllInput = [
	GetMessageListRequest,
	{
		account: UserType;
		databases: WCDatabases;
	},
];

export type AllOutput = Promise<DataAdapterCursorPagination<MessageType[]>>;

export async function all(...inputs: AllInput): AllOutput {
	const [request, context] = inputs;
	const databases = context.databases.message!;
	const { cursor, limit } = request;
	const pageCursor =
		cursor === undefined
			? undefined
			: (JSON.parse(cursor) as MessageListCursor);
	const tableName = `Chat_${CryptoJS.MD5(request.chat.id).toString()}`;
	const table = getChatTable(tableName);
	let source: (typeof databases)[number] | undefined;
	// Each chat table belongs to one message database.
	for (const database of databases) {
		const tables = await database
			.select({ name: sql<string>`name` })
			.from(sql`sqlite_master`)
			.where(and(eq(sql`type`, "table"), eq(sql`name`, tableName)))
			.limit(1);
		if (tables.length) {
			source = database;
			break;
		}
	}
	if (!source) {
		if (pageCursor?.messageLocalId !== undefined)
			throw new Error("Message target not found");
		return { data: [], meta: {} };
	}
	const database = source;
	const filters = [
		request.type !== undefined
			? inArray(
					table.Type,
					Array.isArray(request.type) ? request.type : [request.type],
				)
			: undefined,
		request.type_app !== undefined
			? or(
					...(Array.isArray(request.type_app)
						? request.type_app
						: [request.type_app]
					).map((type) => like(table.Message, `%<type>${type}</type>%`)),
				)
			: undefined,
	];
	let anchor: { value: number; messageLocalId?: string } | undefined;
	if (pageCursor) {
		if (
			pageCursor.messageLocalId !== undefined &&
			(pageCursor.value === undefined || pageCursor.condition === "<>")
		) {
			const [row] = await database
				.select({ createTime: table.CreateTime })
				.from(table)
				.where(
					and(
						...filters,
						eq(table.MesLocalID, sql`${pageCursor.messageLocalId}`),
					),
				)
				.limit(1);
			if (!row) throw new Error("Message target not found");
			anchor = {
				value: row.createTime,
				messageLocalId: pageCursor.messageLocalId,
			};
		} else if (pageCursor.value !== undefined) {
			anchor = {
				value: pageCursor.value,
				messageLocalId: pageCursor.messageLocalId,
			};
		}
	}

	async function read(
		condition: Exclude<MessageListCursor["condition"], "<>">,
	) {
		const isBefore = condition === "<" || condition === "<=";
		const order = isBefore ? desc : asc;
		const compare = { "<": lt, "<=": lte, ">": gt, ">=": gte }[condition];
		let boundary: SQL | undefined;
		if (anchor) {
			boundary =
				anchor.messageLocalId === undefined
					? compare(table.CreateTime, anchor.value)
					: or(
							(isBefore ? lt : gt)(table.CreateTime, anchor.value),
							and(
								eq(table.CreateTime, anchor.value),
								compare(table.MesLocalID, sql`${anchor.messageLocalId}`),
							),
						);
		}
		// 多读一条只用于判断当前方向是否还有数据，不计入返回页。
		const rows = await database
			.select(chatTableSelect(table))
			.from(table)
			.where(and(...filters, boundary))
			.orderBy(order(table.CreateTime), order(table.MesLocalID))
			.limit(limit + 1);
		const data = rows.slice(0, limit);
		if (isBefore) data.reverse();
		return { data, hasMore: rows.length > limit };
	}

	let data: ChatTableSelectInfer[];
	let hasPrevious: boolean;
	let hasNext: boolean;
	// 没有游标时查询最新的数据，但返回时仍按时间正序排列。
	const condition = pageCursor?.condition ?? "<";
	if (condition === "<>") {
		// 两侧各取最多 limit 条并分别判断是否还有更多，目标只包含在后一侧。
		const before = await read("<");
		const after = await read(">=");
		data = [...before.data, ...after.data];
		hasPrevious = before.hasMore;
		hasNext = after.hasMore;
	} else {
		const page = await read(condition);
		const isBefore = condition === "<" || condition === "<=";
		data = page.data;
		// 单向查询尚未确认反方向是否有数据，先保留其游标；查空后停止。
		// 无游标的首页是例外：备份是静态数据，最新一页不会有下一页。
		hasPrevious = isBefore ? page.hasMore : true;
		hasNext = isBefore ? pageCursor !== undefined : page.hasMore;
	}
	// 首次查询以返回页的第一条为包含边界，可用当前游标重新读取这一页。
	const currentCursor =
		cursor ?? (data.length ? encodeCursor(data[0], ">=") : undefined);
	// 翻页以已返回的首尾消息为排除边界，避免重复返回边界消息。
	const meta: DataAdapterCursorPagination<MessageType[]>["meta"] = {
		...(currentCursor !== undefined ? { cursor: currentCursor } : {}),
		...(data.length && hasPrevious
			? { previous_cursor: encodeCursor(data[0], "<") }
			: {}),
		...(data.length && hasNext
			? { next_cursor: encodeCursor(data[data.length - 1], ">") }
			: {}),
	};
	if (!data.length) return { data: [], meta };
	const rows = fallbackUnsupportedMessageQueryRows(
		await WCDB.postProcess(data, {
			databaseSeries: WCDBDatabaseSeriesName.Message,
			tableSeries: WCDBTableSeriesName.Chat,
		}),
	);
	const chats = await ChatController.find({ ids: [request.chat.id] }, context);
	const chat = chats.data[0];
	return {
		data: await parseMessageDatabaseChatTableRows(rows, { ...context, chat }),
		meta,
	};
}

export type findInput = [
	{
		chat: ChatType;
		messageIds: string[];
		parseReplyMessage?: boolean;
	},
	{
		account: UserType;
		databases: WCDatabases;
	},
];

export type findOutput = Promise<DataAdapterResponse<MessageType[]>>;

export async function find(...inputs: findInput): findOutput {
	const [
		{ chat, messageIds, parseReplyMessage = true },
		{ account, databases },
	] = inputs;

	const dbs = databases.message;
	if (!dbs) throw new Error("message databases are not found");

	const tableName = `Chat_${CryptoJS.MD5(chat.id).toString()}`;

	const chatTable = getChatTable(tableName);

	const rows = (
		await Promise.allSettled(
			dbs.map(async (database) => {
				try {
					const query = database
						.select(chatTableSelect(chatTable))
						.from(chatTable)
						// @ts-ignore CAST 语句已经将 MesSvrID 转换为字符串
						.where(inArray(chatTable.MesSvrID, messageIds));

					const rows = await query.all();

					return fallbackUnsupportedMessageQueryRows(
						await WCDB.postProcess(rows, {
							databaseSeries: WCDBDatabaseSeriesName.Message,
							tableSeries: WCDBTableSeriesName.Chat,
						}),
					);
				} catch (error) {
					return [];
				}
			}),
		)
	).flatMap((promiseResult) => {
		if (
			promiseResult.status === "fulfilled" &&
			promiseResult.value.length > 0
		) {
			return promiseResult.value;
		}
		return [];
	});

	if (!rows) {
		return {
			data: [],
		};
	}

	return {
		data: await parseMessageDatabaseChatTableRows(rows, {
			account,
			chat,
			databases,
			parseReplyMessage,
		}),
	};
}

export type allVerifyInput = [
	GetGreetingMessageListRequest,
	{
		databases: WCDatabases;
	},
];

export type allVerifyOutput = GetGreetingMessageListResponse;

export async function allVerify(...inputs: allVerifyInput): allVerifyOutput {
	const [{ account }, { databases }] = inputs;

	const dbs = databases.message;
	if (!dbs) {
		throw new Error("message databases are not found");
	}

	const rows = (
		await Promise.all(
			dbs.map(async (database) => {
				try {
					const databaseTables = await database
						.select({
							name: sql<string>`name`,
						})
						.from(sql`sqlite_master`)
						.where(and(eq(sql`type`, "table"), like(sql`name`, "Hello_%")))
						.all();

					const helloTable = getHelloTable(databaseTables[0].name);

					return await database
						.select(helloTableSelect(helloTable))
						.from(helloTable)
						.orderBy(desc(helloTable.CreateTime))
						.all();
				} catch (error) {
					return [];
				}
			}),
		)
	).filter((row) => row.length > 0)[0];

	return {
		data: transformHelloTableRowToMessage(rows),
	};
}

function transformHelloTableRowToMessage(
	raws: HelloTableSelectInfer[],
): VerityMessageType[] {
	const result: VerityMessageType[] = [];

	raws.forEach((helloTableRow) => {
		if (helloTableRow.Type === MessageTypeEnum.VERITY) {
			const xmlParser = new XMLParser({ ignoreAttributes: false });
			const messageEntity: VerityMessageEntity = xmlParser.parse(
				helloTableRow.Message,
			);
			result.push({
				id: helloTableRow.MesSvrID,
				local_id: helloTableRow.MesLocalID,
				date: helloTableRow.CreateTime,
				direction: helloTableRow.Des,
				type: MessageTypeEnum.VERITY,
				message_entity: messageEntity,
				raw_message: helloTableRow.Message,
				...(import.meta.env.DEV
					? {
							__Dev: { ConIntRes1: helloTableRow.ConIntRes1 },
						}
					: {}),
			});
		} else {
			console.error(
				"Unsupported message type in greeting message database:",
				helloTableRow,
			);
		}
	});

	return result;
}
