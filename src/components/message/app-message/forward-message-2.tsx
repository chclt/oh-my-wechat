import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
import { cn, decodeUnicodeReferences } from "@/lib/utils.ts";

export interface ForwardMessage2Entity {
  type: AppMessageType.FORWARD_MESSAGE_2;
  title: string;
  des: string;
  thumburl: "";
  xmlfulllen: 120685;
  realinnertype: 19;
}

type ForwardMessage2Props = AppMessageProps<ForwardMessage2Entity>;

export default function ForwardMessage2({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: ForwardMessage2Props) {
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message as unknown as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className={cn(
            "py-2.5 px-3 w-fit max-w-[20em] rounded-lg",
            ["bg-[#95EB69] bubble-tail-r", "bg-white bubble-tail-l"][direction],
            "leading-normal break-words text-pretty",
            "space-y-2",
          )}
          {...props}
        >
          <h4 className="font-medium">
            {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
          </h4>
          <div
            className={cn(
              "pl-2 pr-2.5 py-1 text-sm leading-normal text-neutral-600 border-l-2 rounded",
              [
                "bg-white/25 border-white/55",
                "bg-[rgba(222,222,222,0.3)] border-[rgba(193,193,193,0.6)]",
              ][direction],
            )}
          >
            {message.message_entity.msg.appmsg.des}
          </div>
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p {...props}>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      {decodeUnicodeReferences(message.message_entity.msg.appmsg.title)}
    </p>
  );
}
