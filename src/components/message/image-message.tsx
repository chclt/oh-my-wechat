import LocalImage from "@/components/local-image.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { ImageMessage as ImageMessageVM } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

// @ts-ignore
interface ImageMessageProps extends MessageProp<ImageMessageVM> {
  variant?:
    | MessageProp<ImageMessageVM>["variant"]
    | "viewer_detail"
    | "viewer_thumb";
}

export interface ImageMessageEntity {
  msg: {
    img: {
      "@_hdlength": string;
      "@_length": string;
      "@_aeskey": string;
      "@_encryver": "0" | "1";
      "@_md5": string;
      "@_filekey": `${string}_${string}_${string}`;
      "@_uploadcontinuecount": string;
      "@_imgsourceurl": string;
      "@_hevc_mid_size": string;

      "@_cdnbigimgurl": "";

      "@_cdnmidimgurl": string;
      "@_cdnmidheight": string;
      "@_cdnmidwidth": string;

      "@_cdnhdheight": string;
      "@_cdnhdwidth": string;

      "@_cdnthumburl": string;
      "@_cdnthumblength": string;
      "@_cdnthumbwidth": string;
      "@_cdnthumbheight": string;
      "@_cdnthumbaeskey": string;
    };
    appinfo: {
      appid: "";
      appname: "";
      version: 0;
      isforceupdate: 1;
      mediatagname: "";
      messageext: "";
      messageaction: "";
    };
    MMAsset: {
      m_assetUrlForSystem: string;
      m_isNeedOriginImage: 0 | 1;
      m_isFailedFromIcloud: 0 | 1;
      m_isLoadingFromIcloud: 0 | 1;
    };
  };
}

export default function ImageMessage({
  variant = "default",
  message,
  direction,
  showUsername,
  showPhoto,

  className,
  ...props
}: ImageMessageProps) {
  const { chat, setIsOpenMediaViewer } = useApp();

  switch (variant) {
    case "default":
      return (
        <DefaultMessageWithUser
          message={message}
          showPhoto={showPhoto}
          showUsername={showUsername}
        >
          <div
            className={cn(
              "rounded-lg overflow-hidden ",
              ["mask-bubble-tail-r mr-[-5px]", "mask-bubble-tail-l ml-[-5px]"][
                direction
              ],
              className,
            )}
            onClick={() => {
              // setIsOpenMediaViewer(true);
            }}
            {...props}
          >
            <LocalImage
              chat={chat!}
              message={message}
              aspect-ratio
              size="origin"
              alt={"图片"}
              className={
                "max-w-[16em] max-h-[32rem] min-w-32 min-h-16 object-contain bg-white"
              }
            />
          </div>
        </DefaultMessageWithUser>
      );

    case "referenced":
      return (
        <div>
          {showUsername && message.from && (
            <User user={message.from} variant="inline" />
          )}
          <span>: </span>
          <LocalImage
            chat={chat!}
            message={message}
            size="origin"
            alt={""}
            className={
              "inline mx-[0.2em] align-top max-w-16 max-h-16 rounded overflow-hidden"
            }
          />
        </div>
      );

    case "viewer_detail":
    case "viewer_thumb":
      return (
        <div className={cn("", className)} {...props}>
          <LocalImage
            chat={chat!}
            message={message}
            size={variant === "viewer_thumb" ? "thumb" : "origin"}
            alt={""}
            className={""}
          />
        </div>
      );

    default:
      return (
        <p>
          {showUsername && <User user={message.from} variant={"inline"} />}
          {showUsername && ": "}
          <LocalImage
            chat={chat!}
            message={message}
            size="thumb"
            alt={""}
            className={
              "me-1 inline align-middle min-w-4 min-h-4 size-4 object-cover rounded-[3px]"
            }
          />
          [图片]
        </p>
      );
  }
}
