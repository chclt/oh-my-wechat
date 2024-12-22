import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";

export interface LiveMessageEntity {
  type: AppMessageType.LIVE;
  title: string;
  finderLive: {
    finderLiveID: string;
    finderUsername: string;
    finderObjectID: string;
    finderNonceID: string;
    nickname: string;
    headUrl: string;
    liveNickname: string;
    liveUsername: string;
    liveFlag: number;
    media: {
      coverUrl: string;
      height: number;
      width: number;
    };
    chatroomId: string;
  };
}

type LiveMessageProps = AppMessageProps<LiveMessageEntity>;

export default function LiveMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: LiveMessageProps) {
  if (variant === "default") {
    return (
      <DefaultMessageWithUser
        message={message as unknown as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div {...props}>
          [直播] {message.message_entity.msg.appmsg.finderLive.liveNickname})
        </div>
      </DefaultMessageWithUser>
    );
  }

  return (
    <p {...props}>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [直播] {message.message_entity.msg.appmsg.finderLive.liveNickname})
    </p>
  );
}
