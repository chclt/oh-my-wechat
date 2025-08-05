import LocalImage from "@/components/local-image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { AppMessageType } from "@/lib/schema.ts";

export interface StickerMessageEntity {
  type: AppMessageType.STICKER;
  title: string;
  appattach: {
    totallen: number;
    attachid: string;
    cdnattachurl: string;
    emoticonmd5: string;
    aeskey: string;
    fileext: string;
    islargefilemsg: number;
    cdnthumburl: string;
    cdnthumbaeskey: string;
    cdnthumblength: number;
    cdnthumbwidth: number;
    cdnthumbheight: number;
    cdnthumbmd5: string;
  };
}

type StickerMessageProps = AppMessageProps<StickerMessageEntity>;

export default function StickerMessage({
  message,
  variant = "default",
  ...props
}: StickerMessageProps) {
  const chat = message.chat;
  if (variant === "default")
    return (
      <div {...props}>
        <LocalImage
          chat={chat!}
          message={message}
          size="origin"
          domain="opendata"
          className="max-w-32"
        />
      </div>
    );

  return (
    <MessageInlineWrapper message={message} {...props}>
      [表情]
    </MessageInlineWrapper>
  );
}
