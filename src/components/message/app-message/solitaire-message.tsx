import type { AppMessageProps } from "@/components/message/app-message.tsx";
import MessageInlineWrapper from "@/components/message/message-inline.tsx";
import type { AppMessageType } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

export interface SolitaireMessageEntity {
  type: AppMessageType.SOLITAIRE;
  title: string;
  des: string;
  extinfo: {
    solitaire_info: string; // xml
  };
}

type SolitaireProps = AppMessageProps<SolitaireMessageEntity>;

export default function SolitaireMessage({
  message,
  variant = "default",
  ...props
}: SolitaireProps) {
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
        {message.message_entity.msg.appmsg.title}
      </div>
    );

  return (
    <MessageInlineWrapper message={message} {...props}>
      {message.message_entity.msg.appmsg.title}
    </MessageInlineWrapper>
  );
}
