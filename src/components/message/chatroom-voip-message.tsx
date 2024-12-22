import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import type { MessageProp } from "@/components/message/message.tsx";
import type { ChatroomVoipMessage as ChatroomVoipMessageVM } from "@/lib/schema.ts";

type ChatroomVoipMessageProps = MessageProp<ChatroomVoipMessageVM>;

export interface ChatroomVoipMessageEntity {
  msgLocalID: number;
  clientGroupID: string;
  groupID: string;
  lastMsgID: number;
  msgContent: string; // eg. "XXX has started a voice call"
}
export default function ChatroomVoipMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: ChatroomVoipMessageProps) {
  if (message.from) {
    return (
      <DefaultMessageWithUser
        message={message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className="max-w-[20em] py-4 pl-4 pr-6 flex gap-4 items-center bg-white rounded-2xl border border-neutral-200"
          {...props}
        >
          <div className={"shrink-0 size-12 bg-neutral-400 rounded-full"} />
          <div>
            <p>{message.message_entity.msgContent}</p>
          </div>
        </div>
      </DefaultMessageWithUser>
    );
  }

  return (
    <div className={"mx-auto text-sm text-neutral-600"} {...props}>
      <p>{message.message_entity.msgContent}</p>
    </div>
  );
}
