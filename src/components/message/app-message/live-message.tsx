import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { AppMessageType } from "@/lib/schema.ts";

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
  variant = "default",
  ...props
}: LiveMessageProps) {
  if (variant === "default") {
    return (
      <div {...props}>
        [直播] {message.message_entity.msg.appmsg.finderLive.liveNickname})
      </div>
    );
  }

  return (
    <MessageInlineWrapper message={message} {...props}>
      [直播] {message.message_entity.msg.appmsg.finderLive.liveNickname})
    </MessageInlineWrapper>
  );
}
