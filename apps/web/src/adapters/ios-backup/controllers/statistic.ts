import type {
	DataAdapterCursorPagination,
	DataAdapterResponse,
	GetStatisticRequest,
} from "@/adapters/adapter";
import { countStringLength } from "@/lib/utils.ts";
import WechatEmojiTable from "@/lib/wechat-emojis.ts";
import {
	type MessageType,
	type OpenMessageType,
	type TextMessageType,
	type UserType,
	MessageDirection,
	MessageTypeEnum,
} from "@/schema";
import {
	OpenMessageTypeEnum,
	ReferOpenMessageEntity,
} from "@/schema/open-message.ts";
import CryptoJS from "crypto-js";
import { getUnixTime } from "date-fns";
import type { WCDatabases } from "../types";
import * as MessageController from "./message";

export interface ChatStatistics {
	date_contact_added?: string;
	earliest_message_date?: string;
	user_message_count?: { user: UserType; message_count: number }[];

	message_count?: number;
	sent_message_count?: number;
	received_message_count?: number;

	text_message_count?: number;
	sent_text_message_count?: number;
	received_text_message_count?: number;

	image_message_count?: number;
	sent_image_message_count?: number;
	received_image_message_count?: number;

	voice_message_count?: number;
	sent_voice_message_count?: number;
	received_voice_message_count?: number;

	video_message_count?: number;
	sent_video_message_count?: number;
	received_video_message_count?: number;

	sticker_message_count?: number;
	sent_sticker_message_count?: number;
	received_sticker_message_count?: number;

	music_message_count?: number;
	sent_music_message_count?: number;
	received_music_message_count?: number;

	daily_message_count?: { date: string; message_count: number }[];
	daily_sent_message_count?: { date: string; message_count: number }[];
	daily_received_message_count?: { date: string; message_count: number }[];

	hourly_message_count?: { hour: number; message_count: number }[];
	hourly_sent_message_count?: { hour: number; message_count: number }[];
	hourly_received_message_count?: { hour: number; message_count: number }[];

	message_word_count?: number;
	sent_message_word_count?: number;
	received_message_word_count?: number;

	voice_message_total_duration?: number;
	sent_voice_message_total_duration?: number;
	received_voice_message_total_duration?: number;

	sent_sticker_usage?: {
		md5: string;
		count: number;
	}[];

	received_sticker_usage?: {
		md5: string;
		count: number;
	}[];

	sent_wxemoji_usage?: {
		key: string;
		count: number;
	}[];

	received_wxemoji_usage?: {
		key: string;
		count: number;
	}[];
}

export type GetInput = [GetStatisticRequest, { databases: WCDatabases }];
export type GetOutput = Promise<DataAdapterResponse<ChatStatistics>>;

export async function get(...inputs: GetInput): GetOutput {
	const [{ account, chat, startTime, endTime }, { databases }] = inputs;

	const dbs = databases.message;
	if (!dbs) throw new Error("message databases is not found");

	const sessionIdMd5 = CryptoJS.MD5(chat.id).toString();
	const startTimestampUnix = getUnixTime(startTime);
	const endTimestampUnix = getUnixTime(endTime);

	const statistics: ChatStatistics = {};

	/*
	dbs.map((database) => {
		try {
			let databaseQueryResult = [];

			databaseQueryResult = database.exec(
				`
            SELECT CreateTime, Message FROM Chat_${sessionIdMd5}WHERE
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like "你已添加了%，现在可以开始聊天了。")OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like "你已加%為朋友，現在可以聊天了。")OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like "You have added % as your Weixin contact. Start chatting!")OR
              (Type = ${MessageTypeEnum.TEXT} AND Message like "我通过了你的朋友验证请求，现在我们可以开始聊天了")OR
              (Type = ${MessageTypeEnum.TEXT} AND Message like "我通過了你的朋友驗證請求，現在我們可以開始聊天了")OR
              (Type = ${MessageTypeEnum.TEXT} AND Message like "I've accepted your friend request. Now let's chat!")OR
              
              (Type = ${MessageTypeEnum.SYSTEM_EXTENDED} AND Message like '%"$username$"邀请你和"$names$"加入了群聊%')OR
              (Type = ${MessageTypeEnum.SYSTEM_EXTENDED} AND Message like '%"$username$" invited you to this group chat%')OR
              (Type = ${MessageTypeEnum.SYSTEM_EXTENDED} AND Message like '%"$username$"邀请你加入了群聊，群聊参与人还有：$others$%')OR
              (Type = ${MessageTypeEnum.SYSTEM_EXTENDED} AND Message like '%$username$ invited you to a group chat with $others$%')OR
              (Type = ${MessageTypeEnum.SYSTEM_EXTENDED} AND Message like '%$username$ invited you and $names$ to the group chat%')OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like '%你加入了群聊，群聊参与人还有：%')OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like '%你加入了群組，群組成員還有：%')OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like "%You've joined this group chat. Other participants are:%")OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like '%"$username$"邀请你加入了群聊，群聊参与人还有：$others$%')OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like '%$username$ invited you to a group chat with $others$%')OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like '%你通过扫描二维码加入群聊，群聊参与人还有%')OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like "%You've joined the group chat via QR Code. Group chat members%")OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like '%You invited % to join the group.%')OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like '%invited you and % to the group chat%')OR
              (Type = ${MessageTypeEnum.SYSTEM} AND Message like "%You've created a group chat. Friends nearby can join this group chat by entering these required digits: %")              
            LIMIT 1;
            `,
			);

			if (databaseQueryResult.length) {
				statistics.date_contact_added = formatDateTime(
					new Date((databaseQueryResult[0].values[0][0] as number) * 1000),
				);
			}

			databaseQueryResult = database.exec(
				`SELECT CreateTime, Message FROM Chat_${sessionIdMd5} LIMIT 1;`,
			);

			if (databaseQueryResult.length) {
				statistics.earliest_message_date = formatDateTime(
					new Date((databaseQueryResult[0].values[0][0] as number) * 1000),
				);
			}

			/!*
        // 统计聊天中每个用户的发言数量，因为数据格式，需要在查询数据库后额外处理，暂时注释
        databaseQueryResult = database.exec(
          chat.type === "private"
            ? `
          SELECT
            CASE 
              WHEN Des = 0 
              THEN '${adapterWorker._getStoreItem("account").id}'
              ELSE '${chat.user.id}'
              END 
            AS user_id, -- 这里需要一个真实的换行符，所以不要对齐代码了
            COUNT(*) AS message_count
          FROM
            Chat_${sessionIdMd5}
          GROUP BY
            user_id
          ORDER BY
            message_count DESC;
          `
            : `
          SELECT
            CASE 
              WHEN Des = 0 
              THEN '${adapterWorker._getStoreItem("account").id}'
              ELSE SUBSTR(Message, 1, INSTR(Message, ':
') - 1 ) 
              END 
            AS user_id, -- 这里需要一个真实的换行符，所以不要对齐代码了
            COUNT(*) AS message_count
          FROM
            Chat_${sessionIdMd5}
          GROUP BY
            user_id
          ORDER BY
            message_count DESC;
          `,
        );

        if (databaseQueryResult.length) {
          statistics.user_message_count = databaseQueryResult[0].values.map(
            (row) => ({
              user_id: row[0],
              message_count: row[1],
            }),
          );
        }
        *!/

			databaseQueryResult = database.exec(
				`
          SELECT count(1) as message_count          FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix};
          SELECT count(1) as sent_message_count     FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.outgoing};
          SELECT count(1) as received_message_count FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Des = ${MessageDirection.incoming}AND Type != ${MessageTypeEnum.SYSTEM}AND Type != ${MessageTypeEnum.SYSTEM_EXTENDED};
          
          SELECT count(1) as image_message_count          FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Type = ${MessageTypeEnum.IMAGE};
          SELECT count(1) as sent_image_message_count     FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Type = ${MessageTypeEnum.IMAGE}AND Des = ${MessageDirection.outgoing};
          SELECT count(1) as received_image_message_count FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Type = ${MessageTypeEnum.IMAGE}AND Des = ${MessageDirection.incoming};
          
          SELECT count(1) as voice_message_count          FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Type = ${MessageTypeEnum.VOICE};
          SELECT count(1) as sent_voice_message_count     FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Type = ${MessageTypeEnum.VOICE}AND Des = ${MessageDirection.outgoing};
          SELECT count(1) as received_voice_message_count FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Type = ${MessageTypeEnum.VOICE}AND Des = ${MessageDirection.incoming};

          SELECT count(1) as video_message_count          FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND (Type = ${MessageTypeEnum.VIDEO} OR Type = ${MessageTypeEnum.MICROVIDEO});
          SELECT count(1) as sent_video_message_count     FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND (Type = ${MessageTypeEnum.VIDEO} OR Type = ${MessageTypeEnum.MICROVIDEO})AND Des = ${MessageDirection.outgoing};
          SELECT count(1) as received_video_message_count FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND (Type = ${MessageTypeEnum.VIDEO} OR Type = ${MessageTypeEnum.MICROVIDEO})AND Des = ${MessageDirection.incoming};


          SELECT count(1) as sticker_message_count          FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Type = ${MessageTypeEnum.STICKER};
          SELECT count(1) as sent_sticker_message_count     FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Type = ${MessageTypeEnum.STICKER}AND Des = ${MessageDirection.outgoing};
          SELECT count(1) as received_sticker_message_count FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Type = ${MessageTypeEnum.STICKER}AND Des = ${MessageDirection.incoming};

          SELECT count(1) as music_message_count          FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Type = ${MessageTypeEnum.APP}AND Message like '%<type>${AppMessageTypeEnum.MUSIC}</type>%';
          SELECT count(1) as sent_music_message_count     FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Type = ${MessageTypeEnum.APP}AND Message like '%<type>${AppMessageTypeEnum.MUSIC}</type>%' AND Des = ${MessageDirection.outgoing};
          SELECT count(1) as received_music_message_count FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND Type = ${MessageTypeEnum.APP}AND Message like '%<type>${AppMessageTypeEnum.MUSIC}</type>%' AND Des = ${MessageDirection.incoming};

          SELECT count(1) as text_message_count          FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND (Type = ${MessageTypeEnum.TEXT} OR (Type = ${MessageTypeEnum.APP} AND Message like '%<type>${AppMessageTypeEnum.REFER}</type>%'));
          SELECT count(1) as sent_text_message_count     FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND (Type = ${MessageTypeEnum.TEXT}OR (Type = ${MessageTypeEnum.APP}AND Message like '%<type>${AppMessageTypeEnum.REFER}</type>%'))AND Des = ${MessageDirection.outgoing};
          SELECT count(1) as received_text_message_count FROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND (Type = ${MessageTypeEnum.TEXT}OR (Type = ${MessageTypeEnum.APP}AND Message like '%<type>${AppMessageTypeEnum.REFER}</type>%'))AND Des = ${MessageDirection.incoming};
          `,
			);

			if (databaseQueryResult.length) {
				statistics.message_count = databaseQueryResult[0]
					.values[0][0] as number;
				statistics.sent_message_count = databaseQueryResult[1]
					.values[0][0] as number;
				statistics.received_message_count = databaseQueryResult[2]
					.values[0][0] as number;

				statistics.image_message_count = databaseQueryResult[3]
					.values[0][0] as number;
				statistics.sent_image_message_count = databaseQueryResult[4]
					.values[0][0] as number;
				statistics.received_image_message_count = databaseQueryResult[5]
					.values[0][0] as number;

				statistics.voice_message_count = databaseQueryResult[6]
					.values[0][0] as number;
				statistics.sent_voice_message_count = databaseQueryResult[7]
					.values[0][0] as number;
				statistics.received_voice_message_count = databaseQueryResult[8]
					.values[0][0] as number;

				statistics.video_message_count = databaseQueryResult[9]
					.values[0][0] as number;
				statistics.sent_video_message_count = databaseQueryResult[10]
					.values[0][0] as number;
				statistics.received_video_message_count = databaseQueryResult[11]
					.values[0][0] as number;

				statistics.sticker_message_count = databaseQueryResult[12]
					.values[0][0] as number;
				statistics.sent_sticker_message_count = databaseQueryResult[13]
					.values[0][0] as number;
				statistics.received_sticker_message_count = databaseQueryResult[14]
					.values[0][0] as number;

				statistics.music_message_count = databaseQueryResult[15]
					.values[0][0] as number;
				statistics.sent_music_message_count = databaseQueryResult[16]
					.values[0][0] as number;
				statistics.received_music_message_count = databaseQueryResult[17]
					.values[0][0] as number;

				statistics.text_message_count = databaseQueryResult[18]
					.values[0][0] as number;
				statistics.sent_text_message_count = databaseQueryResult[19]
					.values[0][0] as number;
				statistics.received_text_message_count = databaseQueryResult[20]
					.values[0][0] as number;
			}

			databaseQueryResult = database.exec(
				`
          SELECT strftime('%Y/%m/%d', datetime(CreateTime + 8 * 60 * 60, 'unixepoch')) AS date, COUNT(*) AS message_count FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} GROUP BY date ORDER BY date ASC;
          `,
			);

			if (databaseQueryResult.length) {
				statistics.daily_message_count = databaseQueryResult[0].values.map(
					(row) => ({
						date: row[0] as string,
						message_count: row[1] as number,
					}),
				);
			}

			databaseQueryResult = database.exec(
				`
          SELECT strftime('%Y/%m/%d', datetime(CreateTime + 8 * 60 * 60, 'unixepoch')) AS date, COUNT(*) AS message_count FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.outgoing} GROUP BY date ORDER BY date ASC;
          `,
			);

			if (databaseQueryResult.length) {
				statistics.daily_sent_message_count = databaseQueryResult[0].values.map(
					(row) => ({
						date: row[0] as string,
						message_count: row[1] as number,
					}),
				);
			}

			databaseQueryResult = database.exec(
				`
          SELECT strftime('%Y/%m/%d', datetime(CreateTime + 8 * 60 * 60, 'unixepoch')) AS date, COUNT(*) AS message_count FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.incoming} GROUP BY date ORDER BY date ASC;
          `,
			);

			if (databaseQueryResult.length) {
				statistics.daily_received_message_count =
					databaseQueryResult[0].values.map((row) => ({
						date: row[0] as string,
						message_count: row[1] as number,
					}));
			}

			databaseQueryResult = database.exec(
				`
          SELECT strftime('%k', datetime(CreateTime + 8 * 60 * 60, 'unixepoch')) AS hour, COUNT(*) AS message_count FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} GROUP BY hour ORDER BY hour ASC;
          `,
			);

			if (databaseQueryResult.length) {
				statistics.hourly_message_count = databaseQueryResult[0].values.map(
					(row) => ({
						hour: Number.parseInt(row[0] as string),
						message_count: row[1] as number,
					}),
				);
			}

			databaseQueryResult = database.exec(
				`
          SELECT strftime('%k', datetime(CreateTime + 8 * 60 * 60, 'unixepoch')) AS hour, COUNT(*) AS message_count FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.outgoing} GROUP BY hour ORDER BY hour ASC;
          `,
			);

			if (databaseQueryResult.length) {
				statistics.hourly_sent_message_count =
					databaseQueryResult[0].values.map((row) => ({
						hour: Number.parseInt(row[0] as string),
						message_count: row[1] as number,
					}));
			}

			databaseQueryResult = database.exec(
				`
          SELECT strftime('%k', datetime(CreateTime + 8 * 60 * 60, 'unixepoch')) AS hour, COUNT(*) AS message_count FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.incoming} GROUP BY hour ORDER BY hour ASC;
          `,
			);

			if (databaseQueryResult.length) {
				statistics.hourly_received_message_count =
					databaseQueryResult[0].values.map((row) => ({
						hour: Number.parseInt(row[0] as string),
						message_count: row[1] as number,
					}));
			}

			/!*
        // 下面有新的更准确的方法了
        databaseQueryResult = database.exec(
          `
          SELECT sum(length(Message)) as text_message_word_count          FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix}                                        AND (Type = ${MessageType.TEXT});
          SELECT sum(length(Message)) as sent_text_message_word_count     FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.outgoing} AND (Type = ${MessageType.TEXT});
          SELECT sum(length(Message)) as received_text_message_word_count FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.incoming} AND (Type = ${MessageType.TEXT});

          SELECT sum(length(SUBSTR(Message, INSTR(Message, '<title>') + LENGTH('<title>'), INSTR(Message, '</title>') - INSTR(Message, '<title>') - LENGTH('<title>')))) as message_word_count          FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix}                                        AND ((Type = ${MessageType.APP} AND Message like '%<type>${AppMessageType.REFER}</type>%'));
          SELECT sum(length(SUBSTR(Message, INSTR(Message, '<title>') + LENGTH('<title>'), INSTR(Message, '</title>') - INSTR(Message, '<title>') - LENGTH('<title>')))) as sent_message_word_count     FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.outgoing} AND ((Type = ${MessageType.APP} AND Message like '%<type>${AppMessageType.REFER}</type>%'));
          SELECT sum(length(SUBSTR(Message, INSTR(Message, '<title>') + LENGTH('<title>'), INSTR(Message, '</title>') - INSTR(Message, '<title>') - LENGTH('<title>')))) as received_message_word_count FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.incoming} AND ((Type = ${MessageType.APP} AND Message like '%<type>${AppMessageType.REFER}</type>%'));
          
          `,
        );

        if (databaseQueryResult.length) {
          statistics.message_word_count =
            (databaseQueryResult[0].values[0][0] as number) +
            (databaseQueryResult[3].values[0][0] as number);
          statistics.sent_message_word_count =
            (databaseQueryResult[1].values[0][0] as number) +
            (databaseQueryResult[4].values[0][0] as number);
          statistics.received_message_word_count =
            (databaseQueryResult[2].values[0][0] as number) +
            (databaseQueryResult[5].values[0][0] as number);
        }
         *!/

			databaseQueryResult = database.exec(
				`
          SELECT SUM(CAST(SUBSTR(Message, INSTR(Message, 'voicelength="') + LENGTH('voicelength="'), INSTR(SUBSTR(Message, INSTR(Message, 'voicelength="') + LENGTH('voicelength="')), '"') - 1) as REAL) / 1000) as voice_message_total_duration          FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix}                                        AND (Type = ${MessageTypeEnum.VOICE});
          SELECT SUM(CAST(SUBSTR(Message, INSTR(Message, 'voicelength="') + LENGTH('voicelength="'), INSTR(SUBSTR(Message, INSTR(Message, 'voicelength="') + LENGTH('voicelength="')), '"') - 1) as REAL) / 1000) as sent_voice_message_total_duration     FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.outgoing} AND (Type = ${MessageTypeEnum.VOICE});
          SELECT SUM(CAST(SUBSTR(Message, INSTR(Message, 'voicelength="') + LENGTH('voicelength="'), INSTR(SUBSTR(Message, INSTR(Message, 'voicelength="') + LENGTH('voicelength="')), '"') - 1) as REAL) / 1000) as received_voice_message_total_duration FROM Chat_${sessionIdMd5} WHERE CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.incoming} AND (Type = ${MessageTypeEnum.VOICE});
          `,
			);

			if (databaseQueryResult.length) {
				statistics.voice_message_total_duration = databaseQueryResult[0]
					.values[0][0] as number;
				statistics.sent_voice_message_total_duration = databaseQueryResult[1]
					.values[0][0] as number;
				statistics.received_voice_message_total_duration =
					databaseQueryResult[2].values[0][0] as number;
			}

			databaseQueryResult = database.exec(
				`
          SELECT SUBSTR(Message, INSTR(Message, ' md5="') + LENGTH(' md5="'), INSTR(SUBSTR(Message, INSTR(Message, ' md5="') + LENGTH(' md5="')), '"') - 1) as md5, COUNT(*) AS count, MessageFROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND (Type = ${MessageTypeEnum.STICKER}AND Des = ${MessageDirection.outgoing})GROUP BY md5 ORDER BY count DESC;
          `,
			);

			if (databaseQueryResult.length) {
				statistics.sent_sticker_usage = databaseQueryResult[0].values.map(
					(row) => ({
						md5: row[0] as string,
						count: row[1] as number,
						raw_message: row[2] as string,
					}),
				);
			}

			databaseQueryResult = database.exec(
				`
          SELECT SUBSTR(Message, INSTR(Message, ' md5="') + LENGTH(' md5="'), INSTR(SUBSTR(Message, INSTR(Message, ' md5="') + LENGTH(' md5="')), '"') - 1) as md5, COUNT(*) AS count, MessageFROM Chat_${sessionIdMd5}WHERE CreateTime >= ${startTimestampUnix}AND CreateTime <= ${endTimestampUnix}AND (Type = ${MessageTypeEnum.STICKER}AND Des = ${MessageDirection.incoming})GROUP BY md5 ORDER BY count DESC;
          `,
			);

			if (databaseQueryResult.length) {
				statistics.received_sticker_usage = databaseQueryResult[0].values.map(
					(row) => ({
						md5: row[0] as string,
						count: row[1] as number,
						raw_message: row[2] as string,
					}),
				);
			}
		} catch (e) {
			if (e instanceof Error && e.message.startsWith("no such table")) {
				//
			} else {
				console.error(e);
			}
			return [];
		}
	});
*/

	/* 字数和微信表情使用统计 */

	let result: DataAdapterCursorPagination<MessageType[]>;
	let cursor;
	const limit = 2000;
	let sent_word_count = 0;
	let received_word_count = 0;

	const sent_wxemoji_usage: ChatStatistics["sent_wxemoji_usage"] = [];
	const received_wxemoji_usage: ChatStatistics["received_wxemoji_usage"] = [];

	do {
		result = await MessageController.all(
			{
				account: { id: account.id },
				chat: { id: chat.id },
				type: MessageTypeEnum.TEXT,
				limit,
			},
			{
				databases,
			},
		);

		cursor = result.meta.cursor;

		for (const message of result.data) {
			if (message.date > endTimestampUnix || message.date < startTimestampUnix)
				continue;

			const length = countStringLength(
				(message as TextMessageType).message_entity,
			);

			if (message.direction === MessageDirection.outgoing) {
				sent_word_count += length;
			} else {
				received_word_count += length;
			}

			((message as TextMessageType).message_entity.match(/\[\S+\]/g) ?? []).map(
				(wxemojiKey) => {
					if (WechatEmojiTable[wxemojiKey]) {
						if (message.direction === MessageDirection.outgoing) {
							let index = sent_wxemoji_usage.findIndex(
								(i) => i.key === wxemojiKey,
							);
							if (index === -1)
								index =
									sent_wxemoji_usage.push({ key: wxemojiKey, count: 0 }) - 1;
							sent_wxemoji_usage[index].count++;
						} else {
							let index = received_wxemoji_usage.findIndex(
								(i) => i.key === wxemojiKey,
							);
							if (index === -1)
								index =
									received_wxemoji_usage.push({ key: wxemojiKey, count: 0 }) -
									1;
							received_wxemoji_usage[index].count++;
						}
					}
				},
			);
		}
	} while (
		result.data.length === limit &&
		result.data[0].date > startTimestampUnix
	);

	cursor = undefined;

	do {
		result = await MessageController.all(
			{
				account: { id: account.id },
				chat: { id: chat.id },
				type: MessageTypeEnum.APP,
				type_app: OpenMessageTypeEnum.REFER,
				limit,
			},
			{
				databases,
			},
		);

		for (const message of result.data) {
			if (message.date > endTimestampUnix || message.date < startTimestampUnix)
				continue;

			let length = 0;

			try {
				length = countStringLength(
					(message as OpenMessageType<ReferOpenMessageEntity>).message_entity
						.msg.appmsg.title,
				);
			} catch (error) {
				continue;
			}

			if (message.direction === MessageDirection.outgoing) {
				sent_word_count += length;
			} else {
				received_word_count += length;
			}

			(
				(
					message as OpenMessageType<ReferOpenMessageEntity>
				).message_entity.msg.appmsg.title.match(/\[\S+\]/g) ?? []
			).map((wxemojiKey) => {
				if (WechatEmojiTable[wxemojiKey]) {
					if (message.direction === MessageDirection.outgoing) {
						let index = sent_wxemoji_usage.findIndex(
							(i) => i.key === wxemojiKey,
						);
						if (index === -1)
							index =
								sent_wxemoji_usage.push({ key: wxemojiKey, count: 0 }) - 1;
						sent_wxemoji_usage[index].count++;
					} else {
						let index = received_wxemoji_usage.findIndex(
							(i) => i.key === wxemojiKey,
						);
						if (index === -1)
							index =
								received_wxemoji_usage.push({ key: wxemojiKey, count: 0 }) - 1;
						received_wxemoji_usage[index].count++;
					}
				}
			});
		}
	} while (
		result.data.length === limit &&
		result.data[0].date > startTimestampUnix
	);

	statistics.sent_message_word_count = sent_word_count;
	statistics.received_message_word_count = received_word_count;
	statistics.message_word_count = sent_word_count + received_word_count;

	statistics.sent_wxemoji_usage = sent_wxemoji_usage;
	statistics.received_wxemoji_usage = received_wxemoji_usage;

	return {
		data: statistics,
	};
}
