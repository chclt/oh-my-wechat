import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

export interface AnnouncementMessageEntity {
  type: AppMessageType.ANNOUNCEMENT;
  url: string;
  announcement: string; // xml
  textannouncement: string;
  xmlpuretext: number;
}

type AnnouncementMessageProps = AppMessageProps<AnnouncementMessageEntity>;

export default function AnnouncementMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: AnnouncementMessageProps) {
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className={cn(
            "py-2.5 px-3 w-fit max-w-[20em] space-y-[1.5em] rounded-lg",
            ["bg-[#95EB69] bubble-tail-r", "bg-white bubble-tail-l"][direction],
            "leading-normal break-words text-pretty",
            "[&_a]:text-blue-500 [&_a]:underline",
          )}
          {...props}
        >
          <p>
            公告：
            {message.message_entity.msg.appmsg.textannouncement}
          </p>
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p {...props}>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      [公告] {message.message_entity.msg.appmsg.textannouncement})
    </p>
  );
}
