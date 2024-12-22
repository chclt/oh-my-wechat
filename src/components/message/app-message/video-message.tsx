import LocalImage from "@/components/local-image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";

export interface VideoMessageEntity {
  type: AppMessageType.VIDEO;
  title: string;
  des: string;
  url: string;
  lowurl: string;
  appattach: {
    totallen: number;
    attachid: string;
    emoticonmd5: string;
    fileext: string;
    cdnthumburl: string;
    cdnthumbmd5: string;
    cdnthumblength: number;
    cdnthumbwidth: number;
    cdnthumbheight: number;
    cdnthumbaeskey: string;
    aeskey: string;
    encryver: 0 | 1;
    filekey: string;
  };
}

type VideoMessageProps = AppMessageProps<VideoMessageEntity>;

export default function VideoMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: VideoMessageProps) {
  const { chat } = useApp();

  if (variant == "default")
    return (
      <DefaultMessageWithUser
        message={message as unknown as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          title={message.message_entity.msg.appmsg.title}
          className={cn(
            "relative max-w-[20em] flex flex-col rounded-lg bg-white",
          )}
          {...props}
        >
          <a
            href={message.message_entity.msg.appmsg.url}
            target="_blank"
            referrerPolicy="no-referrer"
            rel="noreferrer"
          >
            <div className="p-3">
              <h4 className="font-medium text-pretty line-clamp-3">
                {decodeUnicodeReferences(
                  message.message_entity.msg.appmsg.title,
                )}
              </h4>
              <div className={cn("mt-1 min-h-[2lh] text-neutral-500")}>
                {message.message_entity.msg.appmsg.appattach.cdnthumbmd5 && (
                  <LocalImage
                    chat={chat!}
                    // @ts-ignore
                    message={message}
                    domain="opendata"
                    className={
                      "float-end ms-2 min-h-[2lh] h-[2lh] w-auto rounded"
                    }
                    alt={""}
                  />
                )}
                {message.message_entity.msg.appmsg.des && (
                  <p className="text-pretty line-clamp-5">
                    {decodeUnicodeReferences(
                      message.message_entity.msg.appmsg.des,
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200">
              <small className="[font-size:inherit]">
                {message.message_entity.msg.appinfo?.appname}
              </small>

              <div className={"float-end mt-1 ml-2 size-3.5 [&_svg]:size-full"}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.91885 2.37185C5.91885 1.60366 6.83795 1.20832 7.3956 1.73665L11.2254 5.3648C11.5897 5.70995 11.5897 6.2901 11.2254 6.63525L7.3956 10.2634C6.83795 10.7917 5.91885 10.3964 5.91885 9.6282V8.25385C4.20987 8.28085 3.2561 8.45025 2.66273 8.72025C2.06448 8.9925 1.79598 9.3824 1.45953 10.0386C1.18054 10.5829 0.414285 10.3303 0.419953 9.7811C0.441261 7.7155 0.76968 6.1578 1.75961 5.1375C2.67468 4.19431 4.05393 3.81247 5.91885 3.75719V2.37185Z"
                    fill="#D9D9D9"
                  />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [链接] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
    </p>
  );
}
