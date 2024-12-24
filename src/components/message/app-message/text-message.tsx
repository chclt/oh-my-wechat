import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import { textMessageVariants } from "@/components/message/text-message.tsx";
import User from "@/components/user.tsx";
import type { AppMessageType } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

export interface AppTextMessageEntity {
  type: AppMessageType.TEXT;
  title: string;
  des: string; // eg. a link
}

type TextMessageProps = AppMessageProps<AppTextMessageEntity>;

export default function TextMessage({
  message,
  variant = "default",
  direction,

  showPhoto,
  showUsername,

  className,
  ...props
}: TextMessageProps) {
  if (variant === "default") {
    return (
      <DefaultMessageWithUser
        message={message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className={cn(textMessageVariants({ variant, direction, className }))}
          {...props}
        >
          {message.message_entity.msg.appmsg.title}
        </div>
      </DefaultMessageWithUser>
    );
  }

  return (
    <p {...props}>
      {showUsername && <User user={message.from} variant={"inline"} />}
      {showUsername && ": "}
      {message.message_entity.msg.appmsg.title}
    </p>
  );
}
