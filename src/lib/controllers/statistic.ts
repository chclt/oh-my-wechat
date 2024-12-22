import _global from "@/lib/global.ts";
import {
  type Chat,
  type ControllerResult,
  MessageType,
  type WCDatabases,
} from "@/lib/schema.ts";
import { formatDateTime } from "@/lib/utils.ts";
import CryptoJS from "crypto-js";

export const StatisticController = {
  get: async (
    databases: WCDatabases,
    {
      chat,
    }: {
      chat: Chat;
    }
  ): Promise<ControllerResult<unknown>> => {
    const dbs = databases.message;
    if (!dbs) throw new Error("message databases is not found");

    const sessionIdMd5 = CryptoJS.MD5(chat.id).toString();

    const rows = [
      ...dbs.map((database) => {
        try {
          return [
            // message_count
            `SELECT count(1) as message_count FROM Chat_${sessionIdMd5};`,

            // date_contact_added
            `
            SELECT CreateTime, Message FROM Chat_${sessionIdMd5} WHERE
              (Type = ${MessageType.SYSTEM} AND Message like "你已添加了%，现在可以开始聊天了。") OR
              (Type = ${MessageType.SYSTEM} AND Message like "你已加%為朋友，現在可以聊天了。") OR
              (Type = ${MessageType.SYSTEM} AND Message like "You have added % as your Weixin contact. Start chatting!") OR
              (Type = ${MessageType.TEXT} AND Message like "我通过了你的朋友验证请求，现在我们可以开始聊天了") OR
              (Type = ${MessageType.TEXT} AND Message like "我通過了你的朋友驗證請求，現在我們可以開始聊天了") OR
              (Type = ${MessageType.TEXT} AND Message like "I've accepted your friend request. Now let's chat!") OR
              
              (Type = ${MessageType.SYSTEM_EXTENDED} AND Message like '%"$username$"邀请你和"$names$"加入了群聊%') OR
              (Type = ${MessageType.SYSTEM_EXTENDED} AND Message like '%"$username$" invited you to this group chat%') OR
              (Type = ${MessageType.SYSTEM_EXTENDED} AND Message like '%"$username$"邀请你加入了群聊，群聊参与人还有：$others$%') OR
              (Type = ${MessageType.SYSTEM_EXTENDED} AND Message like '%$username$ invited you to a group chat with $others$%') OR
              (Type = ${MessageType.SYSTEM_EXTENDED} AND Message like '%$username$ invited you and $names$ to the group chat%') OR
              (Type = ${MessageType.SYSTEM} AND Message like '%你加入了群聊，群聊参与人还有：%') OR
              (Type = ${MessageType.SYSTEM} AND Message like '%你加入了群組，群組成員還有：%') OR
              (Type = ${MessageType.SYSTEM} AND Message like "%You've joined this group chat. Other participants are:%") OR
              (Type = ${MessageType.SYSTEM} AND Message like '%"$username$"邀请你加入了群聊，群聊参与人还有：$others$%') OR
              (Type = ${MessageType.SYSTEM} AND Message like '%$username$ invited you to a group chat with $others$%') OR
              (Type = ${MessageType.SYSTEM} AND Message like '%你通过扫描二维码加入群聊，群聊参与人还有%') OR
              (Type = ${MessageType.SYSTEM} AND Message like "%You've joined the group chat via QR Code. Group chat members%") OR
              (Type = ${MessageType.SYSTEM} AND Message like '%You invited % to join the group.%') OR
              (Type = ${MessageType.SYSTEM} AND Message like '%invited you and % to the group chat%') OR
              (Type = ${MessageType.SYSTEM} AND Message like "%You've created a group chat. Friends nearby can join this group chat by entering these required digits: %")              
            LIMIT 1;
            `,

            // first_message_date:
            `SELECT CreateTime, Message FROM Chat_${sessionIdMd5} LIMIT 1;`,

            // daily_message_count
            `
            SELECT 
              strftime('%Y/%m/%d', datetime(CreateTime , 'unixepoch')) AS date,
              COUNT(*) AS message_count
            FROM
              Chat_${sessionIdMd5}
            GROUP BY 
              date
            ORDER BY 
              date ASC;
            `,

            // user_message_count
            chat.type === "private"
              ? `
            SELECT
              CASE 
                WHEN Des = 0 
                THEN '${_global.user?.id ?? ""}'
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
                THEN '${_global.user?.id}'
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
          ].map((sql) => database.exec(sql));
        } catch (e) {
          if (e instanceof Error && e.message.startsWith("no such table")) {
          } else {
            console.error(e);
          }
          return [];
        }
      }),
    ].filter((row) => row.length > 0)[0];

    return {
      data: {
        ...(rows[0]?.[0]?.values?.[0]?.[0]
          ? { message_count: rows[0][0].values[0][0] }
          : {}),

        ...(rows[1]?.[0]?.values?.[0]?.[0]
          ? {
              date_contact_added: formatDateTime(
                new Date((rows[1][0].values[0][0] as number) * 1000)
              ),
            }
          : {}),

        ...(rows[2]?.[0]?.values?.[0]?.[0]
          ? {
              earliest_message_date: formatDateTime(
                new Date((rows[2][0].values[0][0] as number) * 1000)
              ),
            }
          : {}),

        ...(rows[3]?.[0]?.values?.[0]?.[0]
          ? {
              daily_message_count: rows[3][0].values.map((row) => ({
                date: row[0],
                message_count: row[1],
              })),
            }
          : {}),
        ...(rows[4]?.[0]?.values?.[0]?.[0]
          ? {
              user_message_count: rows[4][0].values.map((row) => ({
                user_id: row[0],
                message_count: row[1],
              })),
            }
          : {}),
      },
    };
  },
};
