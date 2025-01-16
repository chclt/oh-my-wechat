import type {
  Chat,
  Chatroom,
  ControllerResult,
  DatabaseSessionAbstractRow,
  GroupChat,
  OfficialAccount,
  OfficialAccountChat,
  PrivateChat,
  User,
  WCDatabases,
} from "@/lib/schema.ts";
import CryptoJS from "crypto-js";
import { ContactController, specialBrandIds } from "./contact";
import _global from "@/lib/global.ts";

export const ChatController = {
  parseDatabaseChatRows: async (
    databases: WCDatabases,
    dbSessionAbstractRows: DatabaseSessionAbstractRow[],
  ): Promise<Chat[]> => {
    const dbSessionAbstractRowsFiltered = dbSessionAbstractRows.filter(
      (row) =>
        !(
          row.UsrName.endsWith("@openim") || // TODO
          // row.UsrName.startsWith("gh_") ||
          // specialBrandIds.includes(row.UsrName) ||
          [
            // "chatroom_session_box",
            // "newsapp",
            "brandsessionholder",
            // "notification_messages",
            "brandsessionholder_weapp",
            // "opencustomerservicemsg",
          ].includes(row.UsrName)
        ),
    );

    const contactRows: (User | Chatroom)[] = (
      await ContactController.in(databases, {
        ids: dbSessionAbstractRowsFiltered.map((row) => row.UsrName),
      })
    ).data;
    const contacts: { [key: string]: User | Chatroom } = {};
    for (const contact of contactRows) {
      contacts[contact.id] = contact;
    }

    const result: Chat[] = [];

    for (const row of dbSessionAbstractRowsFiltered) {
      const contactInfo = contacts[row.UsrName];
      const chat =
        row.UsrName.startsWith("gh_") || specialBrandIds.includes(row.UsrName)
          ? ({
              type: "official_account",
              id: row.UsrName,
              title: contactInfo
                ? (contactInfo.remark ??
                  (contactInfo as OfficialAccount).username)
                : row.UsrName,

              ...(contactInfo?.photo ? { photo: contactInfo.photo.thumb } : {}),
              official_account: contactInfo as OfficialAccount,

              is_muted: !!row.ConIntRes1,
              // @ts-ignore
              is_pinned: (contactInfo as OfficialAccount)._is_pinned,
            } as OfficialAccountChat)
          : row.UsrName.endsWith("@chatroom")
            ? ({
                type: "chatroom",

                id: row.UsrName,
                title: contactInfo
                  ? (contactInfo.remark ?? (contactInfo as Chatroom).title)
                  : "-",
                is_muted: !!row.ConIntRes1,
                // @ts-ignore
                is_pinned: (contactInfo as Chatroom)._is_pinned,
                // @ts-ignore
                is_collapsed: (contactInfo as Chatroom)._is_collapsed,
                ...(contactInfo?.photo
                  ? { photo: contactInfo.photo.thumb }
                  : {}),
                members: (contactInfo as Chatroom).members,

                chatroom: contactInfo as Chatroom,
                raw: {
                  id_md5: CryptoJS.MD5(row.UsrName).toString(),

                  row,
                  contactInfo,
                },
              } as GroupChat)
            : ({
                type: "private",

                id: row.UsrName,
                title: contactInfo
                  ? (contactInfo.remark ?? (contactInfo as User).username)
                  : row.UsrName,
                ...(contactInfo?.photo
                  ? { photo: contactInfo.photo.thumb }
                  : {}),
                is_muted: !!row.ConIntRes1,
                // @ts-ignore
                is_pinned: contactInfo
                  ? (contactInfo as User)._is_pinned
                  : false, // todo
                is_collapsed: false,
                members: [_global.user, contactInfo], // TODO 添加自己

                user: contactInfo,

                raw: {
                  id_md5: CryptoJS.MD5(row.UsrName).toString(),
                  row,
                  contactInfo,
                },
              } as PrivateChat);

      result.push(chat);
    }

    return result;
  },

  all: async (databases: WCDatabases): Promise<ControllerResult<Chat[]>> => {
    const db = databases.session;
    if (!db) {
      throw new Error("session database is not found");
    }

    const dbSessionAbstractRows: DatabaseSessionAbstractRow[] = db
      .exec(
        "SELECT rowid, CreateTime, UsrName, ConIntRes1 FROM SessionAbstract ORDER BY CreateTime Desc",
      )[0]
      .values.reduce((acc, cur) => {
        acc.push({
          rowid: cur[0],
          CreateTime: cur[1],
          UsrName: cur[2],
          ConIntRes1: cur[3],
        } as DatabaseSessionAbstractRow);
        return acc;
      }, [] as DatabaseSessionAbstractRow[]);

    return {
      data: await ChatController.parseDatabaseChatRows(
        databases,
        dbSessionAbstractRows,
      ),
    };
  },

  in: async (
    databases: WCDatabases,
    {
      ids,
    }: {
      ids: string[];
    },
  ): Promise<ControllerResult<Chat[]>> => {
    const db = databases.session;
    if (!db) {
      throw new Error("session database is not found");
    }

    if (ids.length === 0) return { data: [] };

    const dbSessionAbstractRows: DatabaseSessionAbstractRow[] = db
      .exec(
        `SELECT rowid, CreateTime, UsrName, ConIntRes1 FROM SessionAbstract WHERE UsrName IN (${ids.map((id) => `'${id}'`).join(",")}) ORDER BY CreateTime Desc`,
      )[0]
      .values.reduce((acc, cur) => {
        acc.push({
          rowid: cur[0],
          CreateTime: cur[1],
          UsrName: cur[2],
          ConIntRes1: cur[3],
        } as DatabaseSessionAbstractRow);
        return acc;
      }, [] as DatabaseSessionAbstractRow[]);

    return {
      data: await ChatController.parseDatabaseChatRows(
        databases,
        dbSessionAbstractRows,
      ),
    };
  },
};
