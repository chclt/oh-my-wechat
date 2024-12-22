import Link from "@/components/link.tsx";
import LocalImage from "@/components/local-image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";

export interface MusicMessageEntity {
  type: AppMessageType.MUSIC;
  title: string;
  des: string;
  username: "";
  action: "view";
  showtype: 0;
  content: "";
  url: "";
  lowurl: "";
  forwardflag: 0;
  dataurl: string; // 直接播放的 URL
  lowdataurl: "";
  contentattr: 0;

  appattach: {
    attachid: string;
    cdnthumburl: string;
    cdnthumbmd5: string;
    cdnthumblength: number;
    cdnthumbheight: number;
    cdnthumbwidth: number;
    cdnthumbaeskey: string;
    aeskey: string;
    encryver: 1;
    fileext: "";
    islargefilemsg: 0;
  };

  songalbumurl: string; // 专辑图片 url
  songlyric: string; // 歌词，lrc 格式
  musicShareItem: {
    mvSingerName: string;
    mvAlbumName: string;
    mvIssueDate: number;
    mvIdentification: string; // e.g.  "{"songId":"1855080368"}"
    musicDuration: 144863; // 歌曲长度，单位毫秒
  };
}

type MusicMessageProps = AppMessageProps<MusicMessageEntity>;

export default function MusicMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: MusicMessageProps) {
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
            className={cn("relative w-64 rounded-2xl overflow-hidden bg-white")}
            {...props}
          >
            <LocalImage
              chat={chat!}
              message={message}
              size="origin"
              domain="opendata"
              className={"absolute inset-0 w-full h-full object-cover"}
            />

            <div
              className={
                "relative p-4 flex items-center bg-white/20 backdrop-blur"
              }
            >
              <div
                className={
                  "relative shrink-0 size-16 before:content-[''] before:absolute before:-inset-8 before:rounded-full before:bg-black"
                }
              >
                <LocalImage
                  chat={chat!}
                  message={message}
                  size="origin"
                  domain="opendata"
                  className={"relative rounded-full"}
                />
              </div>
              <div className={"ml-12 flex flex-col"}>
                <h4 className="break-words font-medium line-clamp-2">
                  {decodeUnicodeReferences(
                    message.message_entity.msg.appmsg.title,
                  )}
                </h4>
                <p className={"line-clamp-1"}>
                  {decodeUnicodeReferences(
                    message.message_entity.msg.appmsg.des,
                  )}
                </p>
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
      [音乐] {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
    </p>
  );
}