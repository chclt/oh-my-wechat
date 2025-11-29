import type {
	DataAdapterCursorPagination,
	DataAdapterResponse,
	GetMessageListRequest,
} from "@/adapters/adapter.ts";
import type { ChatroomVoipMessageEntity } from "@/components/message/chatroom-voip-message.tsx";
import type { ContactMessageEntity } from "@/components/message/contact-message.tsx";
import type { ImageMessageEntity } from "@/components/message/image-message.tsx";
import type { LocationMessageEntity } from "@/components/message/location-message.tsx";
import type { MailMessageEntity } from "@/components/message/mail-message.tsx";
import type { MicroVideoMessageEntity } from "@/components/message/micro-video-message.tsx";
import type { StickerMessageEntity } from "@/components/message/sticker-message.tsx";
import type { SystemExtendedMessageEntity } from "@/components/message/system-extended-message.tsx";
import type { SystemMessageEntity } from "@/components/message/system-message.tsx";
import type { VerityMessageEntity } from "@/components/message/verify-message.tsx";
import type { VideoMessageEntity } from "@/components/message/video-message.tsx";
import type { VoiceMessageEntity } from "@/components/message/voice-message.tsx";
import type { VoipMessageEntity } from "@/components/message/voip-message.tsx";
import type { WeComContactMessageEntity } from "@/components/message/wecom-contact-message.tsx";
import type { OpenMessageEntity } from "@/components/open-message/open-message.tsx";
import {
	BasicMessageType,
	type ChatroomVoipMessageType,
	type ChatType,
	type ContactMessageType,
	type ImageMessageType,
	type LocationMessageType,
	type MailMessageType,
	MessageDirection,
	type MessageType,
	MessageTypeEnum,
	type MicroVideoMessageType,
	type OpenMessageType,
	type StickerMessageType,
	type SystemExtendedMessageType,
	type SystemMessageType,
	type TextMessageType,
	type UserType,
	type VerityMessageType,
	type VideoMessageType,
	type VoiceMessageType,
	type VoipMessageType,
	type WeComContactMessageType,
} from "@/schema";
import {
	OpenMessageTypeEnum,
	ReferOpenMessageEntity,
} from "@/schema/open-message.ts";
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
} from "drizzle-orm";
import { unionAll } from "drizzle-orm/sqlite-core";
import { XMLParser } from "fast-xml-parser";
import {
	chatTableSelect,
	ChatTableSelectInfer,
	getChatTable,
	getHelloTable,
	helloTableSelect,
	HelloTableSelectInfer,
} from "../database/message.ts";
import type { ControllerPaginatorCursor, WCDatabases } from "../types.ts";
import WCDB, {
	WCDBDatabaseSeriesName,
	WCDBTableSeriesName,
} from "../utils/wcdb.ts";
import { adapterWorker } from "../worker.ts";
import * as ChatController from "./chat.ts";
import * as UserController from "./user.ts";

async function parseMessageDatabaseChatTableRows(
	rows: ChatTableSelectInfer[],
	{
		chat,
		databases,
		parseReplyMessage = true,
	}: {
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
					senderId = adapterWorker._getStoreItem("account").id;
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
					: adapterWorker._getStoreItem("account").id;
			}
		})
		.filter((i) => i !== undefined);
	const usersArray = (
		await UserController.findAll({ ids: messageSenderIds }, { databases })
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
					? messageSenderIds[index] ===
						adapterWorker._getStoreItem("account").id
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
				{ databases },
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

export type AllInput = [
	GetMessageListRequest,
	{
		databases: WCDatabases;
	},
];

export type AllOutput = Promise<DataAdapterCursorPagination<MessageType[]>>;

export async function all(...inputs: AllInput): AllOutput {
	const [{ chatId, type, type_app, cursor, limit = 50 }, { databases }] =
		inputs;

	const cursorObject: Partial<ControllerPaginatorCursor> = {};

	if (cursor) {
		try {
			const parsedCursorObject = JSON.parse(cursor);
			if (parsedCursorObject.value) {
				cursorObject.value = parsedCursorObject.value;
			}
			if (parsedCursorObject.condition) {
				cursorObject.condition = parsedCursorObject.condition;
			}
		} catch (error) {
			//
		}
	}

	const { value: cursor_value, condition: cursor_condition } = cursorObject;

	const query_limit = limit + 1;

	const dbs = databases.message;
	if (!dbs) throw new Error("message databases are not found");

	const tableName = `Chat_${CryptoJS.MD5(chatId).toString()}`;

	const chatTable = getChatTable(tableName);

	// cursor condition
	// 不能直接把操作符放在模板字符串里面。比如 sql`${chatTable.CreateTime} ${cursor_condition} ${cursor_value}` 会报错
	let cursorQueryWhereSegmentCondition: any = undefined;
	if (cursor_value && cursor_condition) {
		switch (cursor_condition) {
			case "<":
				cursorQueryWhereSegmentCondition = lt(
					chatTable.CreateTime,
					cursor_value,
				);
				break;
			case "<=":
				cursorQueryWhereSegmentCondition = lte(
					chatTable.CreateTime,
					cursor_value,
				);
				break;
			case ">":
				cursorQueryWhereSegmentCondition = gt(
					chatTable.CreateTime,
					cursor_value,
				);
				break;
			case ">=":
				cursorQueryWhereSegmentCondition = gte(
					chatTable.CreateTime,
					cursor_value,
				);
				break;
			default:
				break;
		}
	}

	// type condition
	const typeQueryWhereSegmentCondition = type
		? inArray(chatTable.Type, Array.isArray(type) ? type : [type])
		: undefined;

	// type_app condition
	const typeAppQueryWhereSegmentCondition = type_app
		? or(
				...(Array.isArray(type_app) ? type_app : [type_app]).map((i) =>
					like(chatTable.Message, `%<type>${i}</type>%`),
				),
			)
		: undefined;

	// WHERE conditions
	const baseQueryWhereSegmentConditions = [
		cursorQueryWhereSegmentCondition,
		typeQueryWhereSegmentCondition,
		typeAppQueryWhereSegmentCondition,
	].filter((i) => i);

	// WHERE
	const queryWhereSegment = baseQueryWhereSegmentConditions.length
		? and(...baseQueryWhereSegmentConditions)
		: undefined;

	let _chatTableIndex = undefined; // 当前聊天所在的数据库次序

	const rows = (
		await Promise.allSettled(
			dbs.map(async (database, index) => {
				try {
					if (cursor_condition && cursor_value) {
						if (cursor_condition === "<" || cursor_condition === "<=") {
							const bastQuery = database
								.select(chatTableSelect(chatTable))
								.from(chatTable)
								.where(queryWhereSegment)
								.orderBy(desc(chatTable.CreateTime))
								.limit(query_limit)
								.as("baseQuery");

							const query = database
								.select()
								.from(bastQuery)
								.orderBy(asc(bastQuery.CreateTime));

							const rows = query.all();

							return await WCDB.postProcess(rows, {
								databaseSeries: WCDBDatabaseSeriesName.Message,
								tableSeries: WCDBTableSeriesName.Chat,
							});
						} else if (cursor_condition === ">=" || cursor_condition === ">") {
							const query = database
								.select(chatTableSelect(chatTable))
								.from(chatTable)
								.where(queryWhereSegment)
								.orderBy(asc(chatTable.CreateTime))
								.limit(query_limit);

							const rows = query.all();

							return await WCDB.postProcess(rows, {
								databaseSeries: WCDBDatabaseSeriesName.Message,
								tableSeries: WCDBTableSeriesName.Chat,
							});
						} else if (cursor_condition === "<>") {
							const baseLeftQueryWhereSegmentConditions = [
								sql`${chatTable.CreateTime} < ${cursor_value}`,
								typeQueryWhereSegmentCondition,
								typeAppQueryWhereSegmentCondition,
							].filter((i) => i);

							const baseLeftQueryWhereSegment =
								baseLeftQueryWhereSegmentConditions.length
									? and(...baseLeftQueryWhereSegmentConditions)
									: undefined;

							const baseRightQueryWhereSegmentConditions = [
								sql`${chatTable.CreateTime} >= ${cursor_value}`,
								typeQueryWhereSegmentCondition,
								typeAppQueryWhereSegmentCondition,
							].filter((i) => i);

							const baseRightQueryWhereSegment =
								baseRightQueryWhereSegmentConditions.length
									? and(...baseRightQueryWhereSegmentConditions)
									: undefined;

							const baseLeftQuery = database
								.select(chatTableSelect(chatTable))
								.from(chatTable)
								.where(baseLeftQueryWhereSegment)
								.orderBy(desc(chatTable.CreateTime))
								.limit(query_limit)
								.as("baseLeftQuery");

							const baseRightQuery = database
								.select(chatTableSelect(chatTable))
								.from(chatTable)
								.where(baseRightQueryWhereSegment)
								.orderBy(asc(chatTable.CreateTime))
								.limit(query_limit)
								.as("baseRightQuery");

							// @ts-ignore
							const baseQuery = unionAll(baseLeftQuery, baseRightQuery).as(
								"baseQuery",
							);

							const query = database
								.select()
								.from(baseQuery)
								.orderBy(asc(baseQuery.CreateTime));

							const rows = query.all() as unknown as ChatTableSelectInfer[];

							return await WCDB.postProcess(rows, {
								databaseSeries: WCDBDatabaseSeriesName.Message,
								tableSeries: WCDBTableSeriesName.Chat,
							});
						}
					} else {
						// 没有游标的时候查询最新的数据但是按时间正序排列
						// 游标在第一行

						const baseQuery = database
							.select(chatTableSelect(chatTable))
							.from(chatTable)
							.where(queryWhereSegment)
							.orderBy(desc(chatTable.CreateTime))
							.limit(query_limit)
							.as("baseQuery");

						const query = database
							.select()
							.from(baseQuery)
							.orderBy(asc(baseQuery.CreateTime));

						const rows = query.all();

						return await WCDB.postProcess(rows, {
							databaseSeries: WCDBDatabaseSeriesName.Message,
							tableSeries: WCDBTableSeriesName.Chat,
						});
					}
				} catch (e) {
					if (e instanceof Error && e.message.startsWith("no such table")) {
						//
					} else {
						console.error(e);
					}
					return [];
				}
			}),
		)
	).flatMap((promiseResult, index) => {
		if (
			promiseResult.status === "fulfilled" &&
			promiseResult.value &&
			promiseResult.value.length > 0
		) {
			_chatTableIndex = index;
			return promiseResult.value;
		}
		return [];
	});

	if (!rows || rows.length === 0)
		return {
			data: [],
			meta: {},
		};

	// 根据请求游标，和查出来的数据，构建前后的游标
	const cursors: Partial<{
		current: ControllerPaginatorCursor;
		previous: ControllerPaginatorCursor;
		next: ControllerPaginatorCursor;
	}> = {};
	if (cursor_value === undefined && cursor_condition === undefined) {
		if (rows.length === query_limit) {
			// 有前一页，[0] 是前一页的最后一条
			cursors.current = {
				value: rows[1].CreateTime,
				condition: ">=",
			};

			cursors.previous = {
				value: rows[0].CreateTime,
				condition: "<=",
				_hasPreviousPage: true,
			};

			rows.shift(); // 移除第一条数据

			// //  因为是静态数据，后面不会有新数据了，所以其实不会有下一页
			// cursors.next = {
			//   value: raw_message_rows.at(-1).CreateTime,
			//   condition: ">",
			//   _hasNextPage: false,
			// };
		} else {
			cursors.current = {
				value: rows[0].CreateTime,
				condition: ">=",
			};

			// cursors.previous = {
			//   value: raw_message_rows[0].CreateTime,
			//   condition: "<",
			//   _hasPreviousPage: false,
			// };

			//  因为是静态数据，后面不会有新数据了，所以其实不会有下一页
			// cursors.next = {
			//   value: raw_message_rows.at(-1).CreateTime,
			//   condition: ">",
			//   _hasNextPage: false,
			// };
		}
	} else if (cursor_value && cursor_condition) {
		cursors.current = {
			value: cursor_value,
			condition: cursor_condition,
		};

		if (cursor_condition === "<" || cursor_condition === "<=") {
			if (rows.length === query_limit) {
				cursors.previous = {
					value: rows[0].CreateTime,
					condition: "<=",
					_hasPreviousPage: true,
				};

				rows.shift(); // 移除第一条数据
			} else {
				// 其实已经没有前一页了
				// cursors.previous = {
				//   value: raw_message_rows[0].CreateTime,
				//   condition: "<",
				//   _hasPreviousPage: false,
				// };
			}

			cursors.next = {
				value: rows.at(-1)!.CreateTime,
				condition: ">",
				_hasNextPage: "unknown",
			};
		} else if (cursor_condition === ">" || cursor_condition === ">=") {
			if (rows.length === query_limit) {
				cursors.next = {
					value: rows.at(-1)!.CreateTime,
					condition: ">=",
					hasNextPage: true,
				};
			} else {
				// 其实已经没有下一页了
				// cursors.next = {
				//   value: raw_message_rows.at(-1).CreateTime,
				//   condition: ">",
				//   _hasNextPage: false,
				// };
			}

			cursors.previous = {
				value: rows[0].CreateTime,
				condition: "<",
				_hasPreviousPage: "unknown",
			};
		} else if (cursor_condition === "<>") {
			if (
				rows.filter((row) => row.CreateTime < cursor_value).length ===
				query_limit
			) {
				cursors.previous = {
					value: rows[0].CreateTime,
					condition: "<=",
					_hasPreviousPage: true,
				};

				rows.shift(); // 移除第一条数据
			} else {
				// 其实已经没有前一页了
				// cursors.previous = {
				//   value: raw_message_rows[0].CreateTime,
				//   condition: "<",
				//   _hasPreviousPage: false,
				// };
			}

			if (
				rows.filter((row) => row.CreateTime >= cursor_value).length ===
				query_limit
			) {
				cursors.next = {
					value: rows.at(-1)!.CreateTime,
					condition: ">=",
					_hasNextPage: true,
				};

				rows.pop(); // 移除最后一条数据
			} else {
				// 其实已经没有下一页了
				// cursors.next = {
				//   value: raw_message_rows.at(-1).CreateTime,
				//   condition: ">",
				//   _hasNextPage: false,
				// };
			}
		}
	} else {
		console.error("cursor_value and cursor_condition are not set correctly");
	}

	const chats = await ChatController.find({ ids: [chatId] }, { databases });
	const chat = chats.data[0];

	return {
		data: await parseMessageDatabaseChatTableRows(rows, {
			chat,
			databases,
		}),
		meta: {
			...(cursors.current ? { cursor: JSON.stringify(cursors.current) } : {}),
			...(cursors.previous
				? { previous_cursor: JSON.stringify(cursors.previous) }
				: {}),
			...(cursors.next ? { next_cursor: JSON.stringify(cursors.next) } : {}),
		},
		...(import.meta.env.DEV
			? {
					__dev: {
						database: _chatTableIndex
							? `message_${_chatTableIndex + 1}.sqlite`
							: undefined,
						table: tableName,
					},
				}
			: {}),
	};
}

export type AllFromAllInput = [
	{
		type?: MessageTypeEnum | MessageTypeEnum[];
		type_app?: OpenMessageTypeEnum | OpenMessageTypeEnum[];
		limit: number;
	},
	{
		databases: WCDatabases;
	},
];

export type AllFromAllOutput = Promise<
	DataAdapterCursorPagination<MessageType[]>
>;

export async function allFromAll(...inputs: AllFromAllInput): AllFromAllOutput {
	const [{ type, type_app, limit }, { databases }] = inputs;

	if (!databases) {
		throw new Error("databases are not found");
	}

	const chats = await ChatController.all({ databases });

	const chatMessagePromiseResults = (
		await Promise.all(
			chats.data.map((chat) => {
				return all(
					{
						chatId: chat.id,
						type,
						type_app,
						limit,
					},
					{ databases },
				);
			}),
		)
	).flatMap((result) => result.data);

	return {
		data: chatMessagePromiseResults,
		meta: {},
	};
}

export type findInput = [
	{
		chat: ChatType;
		messageIds: string[];
		parseReplyMessage?: boolean;
	},
	{
		databases: WCDatabases;
	},
];

export type findOutput = Promise<DataAdapterResponse<MessageType[]>>;

export async function find(...inputs: findInput): findOutput {
	const [{ chat, messageIds, parseReplyMessage = true }, { databases }] =
		inputs;

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

					const rows = query.all();

					return await WCDB.postProcess(rows, {
						databaseSeries: WCDBDatabaseSeriesName.Message,
						tableSeries: WCDBTableSeriesName.Chat,
					});
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
			chat,
			databases,
			parseReplyMessage,
		}),
	};
}

export type allVerifyInput = [
	{ accountId: string },
	{
		databases: WCDatabases;
	},
];

export type allVerifyOutput = Promise<DataAdapterResponse<VerityMessageType[]>>;

export async function allVerify(...inputs: allVerifyInput): allVerifyOutput {
	const [_, { databases }] = inputs;

	const dbs = databases.message;
	if (!dbs) {
		throw new Error("message databases are not found");
	}

	const rows = [
		...dbs.map((database) => {
			try {
				const databaseTables = database
					.select({
						name: sql<string>`name`,
					})
					.from(sql`sqlite_master`)
					.where(and(eq(sql`type`, "table"), like(sql`name`, "Hello_%")))
					.all();

				const helloTable = getHelloTable(databaseTables[0].name);

				return database
					.select(helloTableSelect(helloTable))
					.from(helloTable)
					.orderBy(desc(helloTable.CreateTime))
					.all();
			} catch (error) {
				return [];
			}
		}),
	].filter((row) => row.length > 0)[0];

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
