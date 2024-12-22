import { ArrowShareRightSolid } from "@/components/central-icon.tsx";
import Image from "@/components/image.tsx";
import Link from "@/components/link.tsx";
import LocalImage from "@/components/local-image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";

export interface UrlMessageEntity {
  type: AppMessageType.URL;
  title: string;
  des?: string;
  username: string;
  action: string;
  content: string;
  url: string;
  lowurl: string;
  forwardflag: number;
  dataurl: string;
  lowdataurl: string;
  contentattr: number;
  streamvideo: {
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
    extinfo: string;
    androidsource: number;
    md5: string;
  };
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
  extinfo: string;
  androidsource: number;
  sourceusername: string;
  sourcedisplayname?: string;
  commenturl: string;
  thumburl?: string;
  mediatagname: string;
  messageaction: string;
  messageext: string;
  emotionpageshared: {
    webviewshared: {
      shareUrlOriginal: string;
      shareUrlOpen: string;
      jsAppId: string;
      publisherId: string;
    };
    template_id: string;
    md5: string;
    weappinfo: {
      username: string;
      appid: string;
      appservicetype: number;
      secflagforsinglepagemode: number;
      videopageinfo: {
        thumbwidth: number;
        thumbheight: number;
        fromopensdk: number;
      };
    };
  };
}

type UrlMessageProps = AppMessageProps<UrlMessageEntity>;

export default function UrlMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: UrlMessageProps) {
  const { chat } = useApp();

  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message as unknown as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <Link href={message.message_entity.msg.appmsg.url}>
          <div
            className={cn(
              "relative max-w-[20em] flex flex-col rounded-lg bg-white",
            )}
            {...props}
          >
            <div className="p-3">
              <h4 className="font-medium text-pretty line-clamp-3">
                {decodeUnicodeReferences(
                  message.message_entity.msg.appmsg.title,
                )}
              </h4>
              <div className={"mt-1 text-pretty line-clamp-5 text-neutral-500"}>
                {message.message_entity.msg.appmsg.thumburl && (
                  <Image
                    className={"float-end ms-2 h-12 w-auto rounded"}
                    src={message.message_entity.msg.appmsg.thumburl}
                    alt={""}
                  />
                )}

                {message.message_entity.msg.appmsg.appattach.cdnthumbmd5 && (
                  <LocalImage
                    chat={chat!}
                    message={message}
                    domain="opendata"
                    className={"float-end ms-2 h-12 w-auto rounded"}
                    alt={""}
                  />
                )}
                {message.message_entity.msg.appmsg.des &&
                  decodeUnicodeReferences(
                    message.message_entity.msg.appmsg.des,
                  )}
              </div>
            </div>

            <div className="px-3 py-1.5 text-sm leading-normal text-neutral-500 border-t border-neutral-200">
              {message.message_entity.msg.appmsg.sourcedisplayname ? (
                <span className={""}>
                  {message.message_entity.msg.appmsg.sourcedisplayname}
                </span>
              ) : (
                <span>&nbsp;</span>
              )}
              <div
                className={
                  "float-end mt-[3px] mb-[4px] ms-1 size-3.5 [&_svg]:size-full text-[#D9D9D9]"
                }
              >
                <ArrowShareRightSolid />
              </div>
            </div>
          </div>
        </Link>
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
