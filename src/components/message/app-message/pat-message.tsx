import type { AppMessageProps } from "@/components/message/app-message.tsx";
import { FormatTextMessageContent } from "@/components/message/text-message.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { AppMessageType, GroupChat } from "@/lib/schema.ts";

export interface PatMessageEntity {
  type: AppMessageType.PAT;
  title: string;
  patMsg: {
    records: {
      record: PatMessageRecord | PatMessageRecord[];
      recordNum: number;
    };
    chatUser: string;
  };
}

interface PatMessageRecord {
  svrId: string;
  pattedUser: string;
  templete: string;
  fromUser: string;
  createTime: number;
}

type PatMessageProps = AppMessageProps<PatMessageEntity>;

export default function PatMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: PatMessageProps) {
  const { chat } = useApp();

  const records = (
    Array.isArray(message.message_entity.msg.appmsg.patMsg.records.record)
      ? message.message_entity.msg.appmsg.patMsg.records.record
      : [message.message_entity.msg.appmsg.patMsg.records.record]
  ).map((record) => {
    const regex = new RegExp(
      `((?:\\\${${record.fromUser}(?:@textstatusicon)?})|(?:\\\${${record.pattedUser}(?:@textstatusicon)?}))`,
      "g",
    );

    const segments = record.templete.split(regex).map((s, index) => {
      if (!s) return null;
      if (new RegExp(`^\\\${${record.fromUser}}$`).test(s)) {
        const user = chat
          ? (chat as GroupChat)?.members?.find(
              (member) => member.id === record.fromUser,
            )
          : undefined;

        return user ? <User user={user} variant={"inline"} /> : record.fromUser;
      }

      if (new RegExp(`^\\\${${record.fromUser}@textstatusicon}$`).test(s))
        return null; // statusicon

      if (new RegExp(`^\\\${${record.pattedUser}}$`).test(s)) {
        const user = chat
          ? (chat as GroupChat)?.members?.find(
              (member) => member.id === record.pattedUser,
            )
          : undefined;

        return user ? (
          <User user={user} variant={"inline"} />
        ) : (
          record.pattedUser
        );
      }

      if (new RegExp(`^\\\${${record.pattedUser}@textstatusicon}$`).test(s))
        return null; // statusicon

      return (
        <FormatTextMessageContent key={index} text={s} variant={"inline"} />
      );
    });

    return segments;
  });

  return (
    <>
      {records.map((record, index) => (
        <div
          key={index}
          className={
            "mx-auto px-14 text-sm text-center text-pretty text-neutral-600"
          }
          {...props}
        >
          <p>{...record}</p>
        </div>
      ))}
    </>
  );
}
