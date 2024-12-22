import LocalVideo from "@/components/local-video.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { MicroVideoMessage as MicroVideoMessageVM } from "@/lib/schema.ts";

type MicroVideoMessageProps = MessageProp<MicroVideoMessageVM>;

export interface MicroVideoMessageEntity {
  msg: {
    videomsg: {
      "@_clientmsgid": string;
      "@_playlength": string;
      "@_length": string;
      "@_type": string;
      "@_status": string;
      "@_fromusername": string;
      "@_aeskey": string;
      "@_cdnvideourl": string;
      "@_cdnthumburl": string;
      "@_cdnthumblength": string;
      "@_cdnthumbwidth": string;
      "@_cdnthumbheight": string;
      "@_cdnthumbaeskey": string;
      "@_encryver": string;
      "@_isplaceholder": string;
      "@_rawlength": string;
      "@_cdnrawvideourl": string;
      "@_cdnrawvideoaeskey": string;
    };
  };
}

export default function MicroVideoMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: MicroVideoMessageProps) {
  const { chat } = useApp();
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div className="" {...props}>
          <LocalVideo chat={chat!} message={message} />
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [视频]
    </p>
  );
}
