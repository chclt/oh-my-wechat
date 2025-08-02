import { ChatController } from "./chat";
import { MessageController } from "./message";
import CryptoJS from "crypto-js";
import { getUnixTime } from "date-fns";
import {
  type Chat,
  type ControllerResult,
  MessageDirection,
  MessageType,
  type User,
  type WCDatabases,
} from "@/lib/schema";
import { type ChatStatistics, StatisticController } from "./statistic";

export interface Wrapped2024Statistics extends ChatStatistics {
  sent_message_word_count_description?: string;
  sent_message_count_description?: string;
  message_count_description?: string;
  user_dates_contact_added?: { user: User; date: string }[];
  chat_message_count?: {
    chat: Chat;
    message_count: number;
    sent_message_count: number;
    received_message_count: number;
  }[];
}

/**
 * 数据统计规则：
 * 计算发送的消息的时候，计算所有聊天，包括单聊群聊，
 * 计算接受消息的时候，只计算所有单聊和没有静音的群聊（is_muted）
 *
 * 这里有很多很糟糕的ts代码。。。
 */

export namespace Wrapped2024Controller {
  export type Wrapped2024Input = [
    {
      startTime: Date;
      endTime: Date;
    },
    { databases: WCDatabases },
  ];
  export type Wrapped2024Output = Promise<
    ControllerResult<Wrapped2024Statistics>
  >;

  export async function wrapped2024(
    ...inputs: Wrapped2024Input
  ): Wrapped2024Output {
    const [{ startTime, endTime }, { databases }] = inputs;

    const chats = (await ChatController.all({ databases })).data.filter(
      (chat) =>
        chat.type === "private" || (chat.type === "chatroom" && !chat.is_muted),
    );

    const allStatistics = [];

    for (const chat of chats) {
      const chatStatistics = await StatisticController.get(
        {
          chat,
          startTime,
          endTime,
        },
        { databases },
      );

      allStatistics.push({
        chat,
        statistics: chatStatistics.data,
      });
    }

    allStatistics.sort(
      (a, b) =>
        (b.statistics.message_count ?? 0) - (a.statistics.message_count ?? 0),
    );

    const statistics: Wrapped2024Statistics = {
      daily_message_count: [],
      daily_sent_message_count: [],
      daily_received_message_count: [],

      hourly_message_count: [],
      hourly_sent_message_count: [],
      hourly_received_message_count: [],

      sent_wxemoji_usage: [],
      received_wxemoji_usage: [],

      user_dates_contact_added: [],
    };

    for (const item of allStatistics) {
      for (const [key, value] of Object.entries(item.statistics)) {
        if (typeof value === "number") {
          // @ts-ignore
          statistics[key] = (statistics[key] ?? 0) + value;
        }

        if (
          [
            "daily_message_count",
            "daily_sent_message_count",
            "daily_received_message_count",
          ].includes(key)
        ) {
          for (const item of value) {
            let dayIndex = (
              statistics[
                key as
                  | "daily_message_count"
                  | "daily_sent_message_count"
                  | "daily_received_message_count"
              ] as {
                date: string;
                message_count: number;
              }[]
            ).findIndex((i) => i.date === item.date);
            if (dayIndex === -1) {
              dayIndex =
                // @ts-ignore
                statistics[key].push({
                  date: item.date,
                  message_count: 0,
                }) - 1;
            }
            // @ts-ignore
            statistics[key][dayIndex].message_count += item.message_count;
          }
        }

        if (
          [
            "hourly_message_count",
            "hourly_sent_message_count",
            "hourly_received_message_count",
          ].includes(key)
        ) {
          for (const item of value) {
            let hourIndex = (
              statistics[
                key as
                  | "hourly_message_count"
                  | "hourly_sent_message_count"
                  | "hourly_received_message_count"
              ] as { hour: number; message_count: number }[]
            ).findIndex((i) => i.hour === item.hour);
            if (hourIndex === -1) {
              hourIndex =
                // @ts-ignore
                statistics[key].push({
                  hour: item.hour,
                  message_count: 0,
                }) - 1;
            }
            // @ts-ignore
            statistics[key][hourIndex].message_count += item.message_count;
          }
        }

        if (["sent_wxemoji_usage", "received_wxemoji_usage"].includes(key)) {
          value.map(
            ({ key: wxemojiKey, count }: { key: string; count: number }) => {
              let index =
                // @ts-ignore
                (statistics[key] as { key: string; count: number }[]).findIndex(
                  (i) => i.key === wxemojiKey,
                );
              if (index === -1)
                index =
                  // @ts-ignore
                  statistics[key].push({
                    key: wxemojiKey,
                    count: 0,
                  }) - 1;

              // @ts-ignore
              statistics[key][index].count += count;
            },
          );
        }
      }
    }

    if (statistics.sent_voice_message_total_duration !== undefined) {
      statistics.sent_voice_message_total_duration = Math.round(
        statistics.sent_voice_message_total_duration,
      );
    }

    statistics.sent_message_word_count_description = "约等于";
    statistics.sent_message_count_description = `${(((statistics.sent_message_word_count! + (statistics.sent_message_count! - statistics.sent_text_message_count!)) * 5 * 2) / 1000 / 4) | 0}`;
    statistics.message_count_description = `${
      Math.round(
        // 文本
        (((((((statistics.message_word_count! /
          statistics.text_message_count! /
          10) |
          0) +
          1) *
          63 +
          120) *
          statistics.text_message_count! +
          // 图片
          250 * statistics.image_message_count! +
          // 表情包
          200 * statistics.sticker_message_count! +
          // 其他
          150 *
            (statistics.message_count! -
              statistics.text_message_count! -
              statistics.image_message_count! -
              statistics.sticker_message_count!)) /
          460) *
          2.45) /
          10,
      ) / 10
    } 米`;

    statistics.user_dates_contact_added = allStatistics
      .reduce(
        (acc, i) => {
          if (i.chat.type === "private" && i.statistics.date_contact_added) {
            acc.push({
              user: i.chat.user,
              date: i.statistics.date_contact_added,
            });
          }
          return acc;
        },
        [] as { user: User; date: string }[],
      )
      .sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    statistics.chat_message_count = allStatistics
      .reduce(
        (acc, i) => {
          acc.push({
            chat: i.chat,
            message_count: i.statistics.message_count ?? 0,
            sent_message_count: i.statistics.sent_message_count ?? 0,
            received_message_count: i.statistics.received_message_count ?? 0,
          });
          return acc;
        },
        [] as {
          chat: Chat;
          message_count: number;
          sent_message_count: number;
          received_message_count: number;
        }[],
      )
      .sort((a, b) => {
        return (b.sent_message_count ?? 0) - (a.sent_message_count ?? 0);
      });

    return {
      data: statistics,
    };
  }

  export type GetRandomMediaMessageInput = [
    {
      limit?: number;
      startTime: Date;
      endTime: Date;
    },
    { databases: WCDatabases },
  ];
  export type GetRandomMediaMessageOutput = Promise<ControllerResult<any[]>>;

  export async function get_random_media_message(
    ...inputs: GetRandomMediaMessageInput
  ): GetRandomMediaMessageOutput {
    const [{ limit = 2, startTime, endTime }, { databases }] = inputs;
    const dbs = databases.message;
    if (!dbs) throw new Error("message databases are not found");

    const startTimestampUnix = getUnixTime(startTime);
    const endTimestampUnix = getUnixTime(endTime);

    const result = [];
    const retry_limit = limit * 5;
    const retry_count = 0;
    const randomChatIndexes: string[] = [];

    const chats = (await ChatController.all({ databases })).data.filter(
      (chat) =>
        chat.type === "private" || (chat.type === "chatroom" && !chat.is_muted),
    );

    do {
      const randomChatIndex = (Math.random() * chats.length) | 0;

      const chat = chats[randomChatIndex];
      const sessionIdMd5 = CryptoJS.MD5(chat.id).toString();

      let databaseQueryResult;
      databaseQueryResult = [
        ...dbs.map((database) => {
          try {
            return database.exec(`
                SELECT
                  COUNT(*) as media_message_count
                FROM
                  Chat_${sessionIdMd5}
                WHERE
                  CreateTime >= ${startTimestampUnix} AND CreateTime < ${endTimestampUnix} AND Des = ${MessageDirection.outgoing} AND Type in (${[MessageType.IMAGE, MessageType.VIDEO, MessageType.MICROVIDEO].join(",")})
                ;
              `);
          } catch (e) {
            return [];
          }
        }),
      ].filter((row) => row.length > 0)[0];

      if (!databaseQueryResult) continue;

      const mediaMessageCount = databaseQueryResult[0].values[0][0];
      if (!mediaMessageCount) continue;
      const randomMediaMessageIndex =
        (Math.random() * (mediaMessageCount as number)) | 0;

      if (
        randomChatIndexes.indexOf(
          `${randomChatIndex}:${randomMediaMessageIndex}`,
        ) === -1
      ) {
        randomChatIndexes.push(`${randomChatIndex}:${randomMediaMessageIndex}`);
      } else {
        continue;
      }

      databaseQueryResult = [
        ...dbs.map((database) => {
          try {
            return database.exec(`
                SELECT
                  CAST (MesSvrID as TEXT) as MesSvrID
                FROM
                  Chat_${sessionIdMd5}
                WHERE
                  CreateTime >= ${startTimestampUnix} AND CreateTime <= ${endTimestampUnix} AND Des = ${MessageDirection.outgoing} AND Type in (${[MessageType.IMAGE, MessageType.VIDEO, MessageType.MICROVIDEO].join(",")})
                LIMIT 1
                OFFSET ${randomMediaMessageIndex}
                ;
              `);
          } catch (e) {
            return [];
          }
        }),
      ].filter((row) => row.length > 0)[0];

      const message = (
        await MessageController.find(
          {
            chat,
            messageIds: databaseQueryResult[0].values.map(
              (row) => row[0] as string,
            ),
            parseReplyMessage: false,
          },
          { databases },
        )
      ).data[0];

      result.push(message);
    } while (result.length < limit && retry_count < retry_limit);

    return {
      data: result,
    };
  }
}
