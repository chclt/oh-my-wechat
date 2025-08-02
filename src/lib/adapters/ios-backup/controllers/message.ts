import type { AppMessageEntity } from "@/components/message/app-message.tsx";
import type { ReferMessageEntity } from "@/components/message/app-message/refer-message.tsx";
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
import { ChatController } from "./chat.ts";
import { ContactController } from "./contact.ts";
import _global from "@/lib/global.ts";
import {
  type AppMessage,
  AppMessageType,
  type Chat,
  type Chatroom,
  type ChatroomVoipMessage,
  type ContactMessage,
  type ControllerPaginatorResult,
  type ControllerResult,
  type DatabaseMessageRow,
  type ImageMessage,
  type LocationMessage,
  type MailMessage,
  MessageDirection,
  MessageType,
  type MessageVM,
  type MicroVideoMessage,
  type StickerMessage,
  type SystemExtendedMessage,
  type SystemMessage,
  type TextMessage,
  type User,
  type VerityMessage,
  type VideoMessage,
  type VoiceMessage,
  type VoipMessage,
  type WCDatabases,
  type WeComContactMessage,
} from "@/lib/schema.ts";
import CryptoJS from "crypto-js";
import { XMLParser } from "fast-xml-parser";

export namespace MessageController {
  async function parseRawMessageRows(
    raw_message_rows: DatabaseMessageRow[],
    {
      chat,
      databases,
      parseReplyMessage = true,
    }: {
      chat?: Chat;
      databases: WCDatabases;
      parseReplyMessage?: boolean;
    },
  ): Promise<MessageVM[]> {
    const messageSenderIds = raw_message_rows
      .map((raw_message_row) => {
        if ((raw_message_row.Message as unknown) === null) {
          raw_message_row.Message = "";
          raw_message_row.Type = 1;
          return chat?.id ?? undefined;
        }

        if (typeof (raw_message_row.Message as unknown) === "object") {
          // Message 字段可能是个二进制，具体情况还未知
          console.log("消息格式错误", raw_message_row);
          raw_message_row.Message = `解析失败的消息：${new TextDecoder(
            "utf-8",
          ).decode(
            new Uint8Array(
              Object.values(
                raw_message_row.Message as unknown as Record<string, number>,
              ),
            ),
          )}
            `;
          raw_message_row.Type = 1;
          return chat?.id ?? undefined;
        }

        if (chat && chat.type === "chatroom") {
          let senderId = "";
          let rawMessageContent = "";

          if (raw_message_row.Des === MessageDirection.outgoing) {
            rawMessageContent = raw_message_row.Message;
            senderId = _global.user!.id;
          } else if (
            raw_message_row.Type === MessageType.SYSTEM ||
            raw_message_row.Message.startsWith("<") ||
            raw_message_row.Message.startsWith('"<')
          ) {
            rawMessageContent = raw_message_row.Message;

            // 有一些消息在内部记录 from，TODO 转账中可能记录在内部的 receiver_username / payer_username，现在是在消息组件里去处理
            const xmlParser = new XMLParser({ ignoreAttributes: false });
            const messageXml = xmlParser.parse(raw_message_row.Message);

            if (messageXml?.msg?.fromusername) {
              senderId = messageXml.msg.fromusername;
            } else {
              if (raw_message_row.Type === MessageType.VIDEO) {
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
            : (_global.user?.id ?? "?");
        }
      })
      .filter((i) => i !== undefined);
    const usersArray = (
      await ContactController.findAll({ ids: messageSenderIds }, { databases })
    ).data;
    const usersTable: { [key: string]: User | Chatroom } = {};
    usersArray.map((user) => {
      usersTable[user.id] = user;
    });

    const messageIndexesHasReplyMessage: number[] = [];
    const replyMessageIds: string[] = [];

    const messages = raw_message_rows.map((raw_message_row, index) => {
      const message = {
        id: raw_message_row.MesSvrID,
        local_id: raw_message_row.MesLocalID,
        type: raw_message_row.Type,
        date: raw_message_row.CreateTime,
        direction:
          // 有些消息比如通话记录的发消息的人，但是记录消息方向不是想要的，可能因为这算系统消息
          (messageSenderIds[index]
            ? messageSenderIds[index] === _global.user?.id
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
        ...(chat ? { chat } : {}),

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
        case MessageType.TEXT: {
          return {
            ...message,
            message_entity: raw_message_row.Message,
          } as TextMessage;
        }

        case MessageType.IMAGE: {
          const messageEntity: ImageMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );
          return {
            ...message,
            message_entity: messageEntity,
          } as ImageMessage;
        }

        case MessageType.VOICE: {
          const messageEntity: VoiceMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );
          return {
            ...message,
            message_entity: messageEntity,
          } as VoiceMessage;
        }

        case MessageType.MAIL: {
          const messageEntity: MailMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );
          return {
            ...message,
            message_entity: messageEntity,
          } as MailMessage;
        }

        case MessageType.VERITY: {
          const messageEntity: VerityMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );
          return {
            ...message,
            message_entity: messageEntity,
          } as VerityMessage;
        }

        case MessageType.CONTACT: {
          const messageEntity: ContactMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );
          return {
            ...message,
            message_entity: messageEntity,
          } as ContactMessage;
        }

        case MessageType.VIDEO: {
          const messageEntity: VideoMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );
          return {
            ...message,
            message_entity: messageEntity,
          } as VideoMessage;
        }

        case MessageType.STICKER: {
          const messageEntity: StickerMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );
          return {
            ...message,
            message_entity: messageEntity,
          } as StickerMessage;
        }

        case MessageType.LOCATION: {
          const messageEntity: LocationMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );

          return {
            ...message,
            message_entity: messageEntity,
          } as LocationMessage;
        }

        case MessageType.APP: {
          const messageEntity: AppMessageEntity<{ type: number }> =
            xmlParser.parse(raw_message_row.Message);

          try {
            if (messageEntity.msg.appmsg.type === AppMessageType.REFER) {
              messageIndexesHasReplyMessage.push(index);

              const replyMessageId = (
                messageEntity as AppMessageEntity<ReferMessageEntity>
              ).msg.appmsg.refermsg.svrid;
              replyMessageIds.push(replyMessageId);
            }
          } catch (error) {}

          return {
            ...message,
            message_entity: messageEntity,
          } as AppMessage<ReferMessageEntity>;
        }

        case MessageType.VOIP: {
          const messageEntity: VoipMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );

          return {
            ...message,
            message_entity: messageEntity,
          } as VoipMessage;
        }

        case MessageType.MICROVIDEO: {
          const messageEntity: MicroVideoMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );

          return {
            ...message,
            message_entity: messageEntity,
          } as MicroVideoMessage;
        }

        case MessageType.GROUP_VOIP: {
          const messageEntity: ChatroomVoipMessageEntity = JSON.parse(
            raw_message_row.Message,
          );

          return {
            ...message,
            message_entity: messageEntity,
          } as ChatroomVoipMessage;
        }

        case MessageType.WECOM_CONTACT: {
          const messageEntity: WeComContactMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );

          return {
            ...message,
            message_entity: messageEntity,
          } as WeComContactMessage;
        }

        case MessageType.SYSTEM: {
          const messageEntity: SystemMessageEntity = raw_message_row.Message;

          return {
            ...message,
            message_entity: messageEntity,
          } as SystemMessage;
        }

        case MessageType.SYSTEM_EXTENDED: {
          const messageEntity: SystemExtendedMessageEntity = xmlParser.parse(
            raw_message_row.Message,
          );

          return {
            ...message,
            message_entity: messageEntity,
          } as SystemExtendedMessage;
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
    let replyMessageArray: MessageVM[] = [];

    if (parseReplyMessage && chat && replyMessageIds.length) {
      replyMessageArray = (
        await MessageController.find(
          {
            chat,
            messageIds: replyMessageIds,
          },
          { databases },
        )
      ).data;

      const replyMessageTable: { [key: string]: MessageVM } = {};
      replyMessageArray.map((message) => {
        replyMessageTable[message.id] = message;
      });

      for (const index of messageIndexesHasReplyMessage) {
        (messages[index] as AppMessage<ReferMessageEntity>).reply_to_message =
          replyMessageTable[
            (
              messages[index]
                .message_entity as AppMessageEntity<ReferMessageEntity>
            ).msg.appmsg.refermsg.svrid
          ];
      }
    }

    return messages as MessageVM[];
  }

  export type AllInput = [
    {
      chat: Chat;
      type?: MessageType | MessageType[];
      type_app?: AppMessageType | AppMessageType[]; // 有 bug
      cursor?: number;
      cursor_condition?: ControllerPaginatorResult<unknown>["meta"]["cursor_condition"];
      limit: number;
    },
    {
      databases: WCDatabases;
    },
  ];

  export type AllOutput = Promise<ControllerPaginatorResult<MessageVM[]>>;

  export async function all(...inputs: AllInput): AllOutput {
    const [
      { chat, type, type_app, cursor, cursor_condition = ">=", limit = 50 },
      { databases },
    ] = inputs;

    const dbs = databases.message;
    if (!dbs) throw new Error("message databases are not found");

    const rows = [
      ...dbs.map((database) => {
        try {
          if (cursor) {
            if (cursor_condition === "<" || cursor_condition === "<=") {
              return database.exec(`
                SELECT 
                  * 
                FROM (
                  SELECT 
                      rowid, CreateTime, Des, ImgStatus, MesLocalID, Message, CAST(MesSvrID as TEXT) as MesSvrID, Status, TableVer, Type
                  FROM Chat_${CryptoJS.MD5(chat.id).toString()}
                  WHERE
                    ${[
                      `CreateTime ${cursor_condition} ${cursor}`,
                      type
                        ? `Type IN (${
                            Array.isArray(type) ? type.join(", ") : type
                          })`
                        : undefined,
                      type === MessageType.APP && type_app
                        ? `(${(Array.isArray(type_app) ? type_app : [type_app])
                            .map((i) => `Message like '%<type>${i}</type>%'`)
                            .join(" OR ")})`
                        : undefined,
                    ]
                      .filter((i) => i)
                      .join(" AND ")}
                  ORDER BY CreateTime DESC
                  LIMIT ${limit}
                ) 
                ORDER BY CreateTime ASC;
              `);
            }

            if (cursor_condition === ">=" || cursor_condition === ">") {
              return database.exec(`
                SELECT 
                    rowid, CreateTime, Des, ImgStatus, MesLocalID, Message, CAST (MesSvrID as TEXT) as MesSvrID, Status, TableVer, Type 
              FROM 
                  Chat_${CryptoJS.MD5(chat.id).toString()} 
              WHERE 
                  ${[
                    `CreateTime ${cursor_condition} ${cursor}`,
                    type
                      ? `Type IN (${
                          Array.isArray(type) ? type.join(", ") : type
                        })`
                      : undefined,
                    type === MessageType.APP && type_app
                      ? `(${(Array.isArray(type_app) ? type_app : [type_app])
                          .map((i) => `Message like '%<type>${i}</type>%'`)
                          .join(" OR ")})`
                      : undefined,
                  ]
                    .filter((i) => i)
                    .join(" AND ")}
              ORDER BY CreateTime ASC 
              LIMIT ${limit};
            `);
            }

            return database.exec(
              `
                SELECT * FROM (
                  SELECT * FROM (
                    SELECT 
                      rowid, CreateTime, Des, ImgStatus, MesLocalID, Message, CAST(MesSvrID as TEXT) as MesSvrID, Status, TableVer, Type
                    FROM Chat_${CryptoJS.MD5(chat.id).toString()}
                    WHERE ${[
                      `CreateTime < ${cursor}`,
                      type
                        ? `Type IN (${
                            Array.isArray(type) ? type.join(", ") : type
                          })`
                        : undefined,
                      type === MessageType.APP && type_app
                        ? `(${(Array.isArray(type_app) ? type_app : [type_app])
                            .map((i) => `Message like '%<type>${i}</type>%'`)
                            .join(" OR ")})`
                        : undefined,
                    ]
                      .filter((i) => i)
                      .join(" AND ")}
                    ORDER BY CreateTime DESC
                    LIMIT ${limit}
                  )

                  UNION ALL

                  SELECT * FROM (
                    SELECT 
                      rowid, CreateTime, Des, ImgStatus, MesLocalID, Message, CAST(MesSvrID as TEXT) as MesSvrID, Status, TableVer, Type
                    FROM Chat_${CryptoJS.MD5(chat.id).toString()}
                    WHERE ${[
                      `CreateTime >= ${cursor}`,
                      type
                        ? `Type IN (${
                            Array.isArray(type) ? type.join(", ") : type
                          })`
                        : undefined,
                      type === MessageType.APP && type_app
                        ? `(${(Array.isArray(type_app) ? type_app : [type_app])
                            .map((i) => `Message like '%<type>${i}</type>%'`)
                            .join(" OR ")})`
                        : undefined,
                    ]
                      .filter((i) => i)
                      .join(" AND ")}
                    ORDER BY CreateTime ASC
                    LIMIT ${limit}
                  )
                ) 
                ORDER BY CreateTime ASC;
              `,
            );
          }

          // 没有游标的时候查询最新的数据但是按时间正序排列
          // 游标在第一行
          return database.exec(`
            SELECT 
              * 
            FROM (
              SELECT 
                  rowid, CreateTime, Des, ImgStatus, MesLocalID, Message, CAST(MesSvrID as TEXT) as MesSvrID, Status, TableVer, Type
              FROM Chat_${CryptoJS.MD5(chat.id).toString()}
              ${
                type
                  ? `WHERE ${[
                      `Type IN (${
                        Array.isArray(type) ? type.join(", ") : type
                      })`,
                      type === MessageType.APP && type_app
                        ? `(${(Array.isArray(type_app) ? type_app : [type_app])
                            .map((i) => `Message like '%<type>${i}</type>%'`)
                            .join(" OR ")})`
                        : undefined,
                    ]
                      .filter((i) => i)
                      .join(" AND ")}`
                  : ""
              }
              ORDER BY CreateTime DESC
              LIMIT ${limit}
            ) 
            ORDER BY CreateTime ASC;
          `);
        } catch (e) {
          if (e instanceof Error && e.message.startsWith("no such table")) {
          } else {
            console.error(e);
          }
          return [];
        }
      }),
    ].filter((row, index) => {
      if (row.length > 0) {
        if (_global.enableDebug)
          console.log(
            chat.title,
            `Chat_${CryptoJS.MD5(chat.id).toString()}`,
            `message_${index + 1}.sqlite`,
          );
      }

      return row.length > 0;
    })[0];

    if (!rows || rows.length === 0)
      return {
        data: [],
        meta: {},
      };

    const raw_message_rows: DatabaseMessageRow[] = [];

    for (const row of rows[0].values) {
      const [
        rowid,
        CreateTime,
        Des,
        ImgStatus,
        MesLocalID,
        Message,
        MesSvrID,
        Status,
        TableVer,
        Type,
      ] = row as [
        number,
        number,
        MessageDirection,
        1 | 2,
        string,
        string,
        string,
        number,
        number,
        number,
      ];

      raw_message_rows.push({
        rowid,
        CreateTime,
        Des,
        ImgStatus,
        MesLocalID,
        Message,
        MesSvrID,
        Status,
        TableVer,
        Type,
      });
    }

    const currentCursor = raw_message_rows[0].CreateTime;
    const currentCursorCondition = ">=";

    return {
      data: await parseRawMessageRows(raw_message_rows, {
        chat,
        databases,
      }),
      meta: {
        cursor: currentCursor,
        cursor_condition: currentCursorCondition,
        ...(raw_message_rows.length > 0
          ? {
              next_cursor:
                raw_message_rows[raw_message_rows.length - 1].CreateTime,
            }
          : {}),
      },
    };
  }

  export type AllFromAllInput = [
    {
      type?: MessageType | MessageType[];
      type_app?: AppMessageType | AppMessageType[];
      limit: number;
    },
    {
      databases: WCDatabases;
    },
  ];

  export type AllFromAllOutput = Promise<
    ControllerPaginatorResult<MessageVM[]>
  >;

  export async function allFromAll(
    ...inputs: AllFromAllInput
  ): AllFromAllOutput {
    const [{ type, type_app, limit }, { databases }] = inputs;

    if (!databases) {
      throw new Error("databases are not found");
    }

    const chats = await ChatController.all(databases);

    const chatMessagePromiseResults = (
      await Promise.all(
        chats.data.map((chat) => {
          return MessageController.all(databases, {
            chat,
            type,
            type_app,
            limit,
          });
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
      chat: Chat;
      messageIds: string[];
      parseReplyMessage?: boolean;
    },
    {
      databases: WCDatabases;
    },
  ];

  export type findOutput = Promise<ControllerResult<MessageVM[]>>;

  export async function find(...inputs: findInput): findOutput {
    const [{ chat, messageIds, parseReplyMessage = true }, { databases }] =
      inputs;

    const dbs = databases.message;
    if (!dbs) throw new Error("message databases are not found");

    const rows = [
      ...dbs.map((database) => {
        try {
          return database.exec(`
            SELECT 
                rowid, CreateTime, Des, ImgStatus, MesLocalID, Message, CAST (MesSvrID as TEXT) as MesSvrID, Status, TableVer, Type 
            FROM 
                Chat_${CryptoJS.MD5(chat.id).toString()} 
            WHERE 
                MesSvrID IN (${messageIds.map((id) => `'${id}'`).join(",")});
            ;
          `);
        } catch (e) {
          return [];
        }
      }),
    ].filter((row) => row.length > 0)[0];

    const raw_message_rows: DatabaseMessageRow[] = [];

    // TODO
    if (!rows) {
      return {
        data: [],
      };
    }

    for (const row of rows[0].values) {
      const [
        rowid,
        CreateTime,
        Des,
        ImgStatus,
        MesLocalID,
        Message,
        MesSvrID,
        Status,
        TableVer,
        Type,
      ] = row as [
        number,
        number,
        MessageDirection,
        1 | 2,
        string,
        string,
        string,
        number,
        number,
        number,
      ];

      raw_message_rows.push({
        rowid,
        CreateTime,
        Des,
        ImgStatus,
        MesLocalID,
        Message,
        MesSvrID,
        Status,
        TableVer,
        Type,
      });
    }

    return {
      data: await MessageController.parseRawMessageRows(raw_message_rows, {
        chat,
        databases,
        parseReplyMessage,
      }),
    };
  }

  export type allVerifyInput = [
    {
      databases: WCDatabases;
    },
  ];

  export type allVerifyOutput = Promise<ControllerResult<MessageVM[]>>;

  export async function allVerify(...inputs: allVerifyInput): allVerifyOutput {
    const [{ databases }] = inputs;

    const dbs = databases.message;
    if (!dbs) {
      throw new Error("message databases are not found");
    }

    const rows = [
      ...dbs.map((database) => {
        try {
          const tableNames = database.exec(
            'SELECT name FROM sqlite_master WHERE type = "table" AND name LIKE "Hello_%";',
          );

          return database.exec(`
            SELECT 
                rowid, CreateTime, Des, ImgStatus, MesLocalID, Message, CAST (MesSvrID as TEXT) as MesSvrID, Status, TableVer, Type 
            FROM 
                ${tableNames[0].values[0][0]} 
            ORDER BY CreateTime DESC;
          `);
        } catch (e) {
          return [];
        }
      }),
    ].filter((row) => row.length > 0)[0];

    const raw_message_rows: DatabaseMessageRow[] = [];

    for (const row of rows[0].values) {
      const [
        rowid,
        CreateTime,
        Des,
        ImgStatus,
        MesLocalID,
        Message,
        MesSvrID,
        Status,
        TableVer,
        Type,
      ] = row as [
        number,
        number,
        MessageDirection,
        1 | 2,
        string,
        string,
        string,
        number,
        number,
        number,
      ];

      raw_message_rows.push({
        rowid,
        CreateTime,
        Des,
        ImgStatus,
        MesLocalID,
        Message,
        MesSvrID,
        Status,
        TableVer,
        Type,
      });
    }

    return {
      data: await MessageController.parseRawMessageRows(raw_message_rows, {
        databases,
      }),
    };
  }
}
