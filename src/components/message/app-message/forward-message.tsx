import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";
import { XMLParser } from "fast-xml-parser";

export interface ForwardMessageEntity {
  type: AppMessageType.FORWARD_MESSAGE;
  title: string;
  des: string;
  recorditem: string;
  appattach: {
    attachid: string;
    cdnthumburl: string;
    cdnthumbmd5: string;
    cdnthumblength: number;
    cdnthumbheight: number;
    cdnthumbwidth: number;
    cdnthumbaeskey: string;
    aeskey: string;
    encryver: number;
    fileext: string;
    islargefilemsg: number;
  };
  md5: string;
}

interface Record {
  recordinfo: {
    title: string;
    desc: string;
    datalist: {
      dataitem: {
        datadesc: string;
        sourcename: string;
        sourceheadurl: string;
        sourcetime: string;
        dataitemsource: {
          hashusername: string;
          realchatname?: string;
          fromusr?: string;
        };
      }[];
    };
    favusername: string;
  };
}

type ForwardMessageProps = AppMessageProps<ForwardMessageEntity>;

export default function ForwardMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  className,
  ...props
}: ForwardMessageProps) {
  const xmlParser = new XMLParser({
    parseTagValue: false,
  });
  const records: Record = xmlParser.parse(
    decodeUnicodeReferences(
      message.message_entity.msg.appmsg.recorditem.replace(/&#x20;/g, " "), // 有些时候标签和属性之间的空格编码过
    ),
  );

  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message as unknown as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className={cn(
            "py-2.5 px-3 w-fit max-w-[20em] rounded-lg",
            ["bg-[#95EB69] bubble-tail-r", "bg-white bubble-tail-l"][direction],
            "leading-normal break-words text-pretty",
            "space-y-2",
            className,
          )}
          {...props}
        >
          <h4 className="font-medium">
            {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
          </h4>
          {records && (
            <div
              className={cn(
                "pl-2 pr-2.5 py-1 text-sm leading-normal text-neutral-600 border-l-2 rounded",
                [
                  "bg-white/25 border-white/55",
                  "bg-[rgba(222,222,222,0.3)] border-[rgba(193,193,193,0.6)]",
                ][direction],
                className,
              )}
            >
              {(Array.isArray(records.recordinfo.datalist.dataitem)
                ? records.recordinfo.datalist.dataitem
                : [records.recordinfo.datalist.dataitem]
              ).map((i, index) => (
                <p key={index}>
                  <User
                    variant="inline"
                    user={{
                      id: i.sourcename,
                      user_id: i.sourcename,
                      username: i.sourcename,
                      photo: { thumb: i.sourceheadurl },
                      bio: "",
                    }}
                  />
                  : {i.datadesc ? decodeUnicodeReferences(i.datadesc) : null}
                </p>
              ))}
            </div>
          )}
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      <span>{message.message_entity.msg.appmsg.title}</span>
    </p>
  );
}
