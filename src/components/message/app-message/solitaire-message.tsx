import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import User from "@/components/user.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";
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
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  className,
  ...props
}: SolitaireProps) {
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message as unknown as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className={cn(
            "py-2.5 px-3 w-fit max-w-[20em] space-y-[1.5em] rounded-lg",
            ["bg-[#95EB69] bubble-tail-r", "bg-white bubble-tail-l"][direction],
            "leading-normal break-words text-pretty",
            "[&_a]:text-blue-500 [&_a]:underline",
            className,
          )}
          {...props}
        >
          {message.message_entity.msg.appmsg.title}
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <p>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      {message.message_entity.msg.appmsg.title}
    </p>
  );
}
