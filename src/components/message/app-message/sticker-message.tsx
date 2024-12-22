import LocalImage from "@/components/local-image.tsx";
import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
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
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: StickerMessageProps) {
  const { chat } = useApp();

  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div {...props}>
          <LocalImage
            chat={chat!}
            message={message}
            size={"origin"}
            domain={"opendata"}
            className={"max-w-[8rem]"}
          />
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [表情]
    </p>
  );
}
