import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { AppMessageType } from "@/lib/schema.ts";
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
  variant = "default",
  ...props
}: AnnouncementMessageProps) {
  if (variant === "default")
    return (
      <div
        className={cn(
          "py-2.5 px-3 w-fit max-w-[20em] space-y-[1.5em] rounded-lg",
          ["bg-[#95EB69] bubble-tail-r", "bg-white bubble-tail-l"][
            message.direction
          ],
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
    );

  return (
    <MessageInlineWrapper message={message} {...props}>
      [公告] {message.message_entity.msg.appmsg.textannouncement})
    </MessageInlineWrapper>
  );
}
