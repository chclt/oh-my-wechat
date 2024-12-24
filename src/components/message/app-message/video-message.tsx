import { LinkCard } from "@/components/link-card.tsx";
import LocalImage from "@/components/local-image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
import { decodeUnicodeReferences } from "@/lib/utils.ts";

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

  const heading = decodeUnicodeReferences(
    message.message_entity.msg.appmsg.title,
  );
  const preview = message.message_entity.msg.appmsg.appattach.cdnthumbmd5 ? (
    <LocalImage
      chat={chat!}
      message={message}
      domain="opendata"
      alt={heading}
    />
  ) : undefined;

  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message as unknown as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <LinkCard
          href={message.message_entity.msg.appmsg.url}
          heading={heading}
          abstract={message.message_entity.msg.appmsg.des}
          preview={preview}
          from={message.message_entity.msg.appinfo?.appname}
          {...props}
        />
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [链接] {heading}
    </p>
  );
}
