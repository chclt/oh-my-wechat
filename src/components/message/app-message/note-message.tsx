import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { AppMessageType } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

export interface NoteMessageEntity {
  type: AppMessageType.NOTE;
  title: string;

  des: string;

  appattach: {
    totallen: 0;
    attachid: "";
    emoticonmd5: "";
    fileext: "";
    cdnthumburl: "3057020100044b304902010002048e4b4b5002032f4f5502049072512a020462dde0e7042435393161316662362d613337322d346165382d623930302d3937313937373130336635650204011400030201000405004c52ad00";
    cdnthumbmd5: "8e0f8dd384f61d4ce7c8d6b0ac24957b";
    cdnthumblength: 535166;
    cdnthumbwidth: 0;
    cdnthumbheight: 0;
    cdnthumbaeskey: "1408d23efd8a89e08719f683308b28db";
    aeskey: "";
  };
  recorditem: string; // xml
}

type NoteMessageProps = AppMessageProps<NoteMessageEntity>;

export default function NoteMessage({
  message,
  variant = "default",
  ...props
}: NoteMessageProps) {
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
          笔记：
          {message.message_entity.msg.appmsg.des}
        </p>
      </div>
    );

  return (
    <MessageInlineWrapper message={message} {...props}>
      [笔记] {message.message_entity.msg.appmsg.des})
    </MessageInlineWrapper>
  );
}
