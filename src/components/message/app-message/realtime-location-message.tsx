import type { AppMessageProps } from "@/components/message/app-message.tsx";
import DefaultMessageWithUser from "@/components/message/default-message-with-user.tsx";
import type { AppMessageType, Message } from "@/lib/schema.ts";

export interface RealtimeLocationMessageEntity {
  type: AppMessageType.REALTIME_LOCATION;
  title: string; // eg. "我发起了位置共享"
}

type RealtimeLocationMessageProps =
  AppMessageProps<RealtimeLocationMessageEntity>;

export default function RealtimeLocationMessage({
  message,
  direction,
  variant = "default",
  showPhoto,
  showUsername,
  ...props
}: RealtimeLocationMessageProps) {
  if (variant === "default")
    return (
      <DefaultMessageWithUser
        message={message as Message}
        showPhoto={showPhoto}
        showUsername={showUsername}
      >
        <div
          className="w-64 py-4 pl-4 pr-6 flex gap-4 items-center bg-white rounded-2xl border border-neutral-200"
          {...props}
        >
          <div className={"shrink-0 size-12 bg-neutral-400 rounded-full"} />
          <div>
            <h4 className={"font-medium"}>
              {message.from.remark ?? message.from.username}发起了位置共享
            </h4>
          </div>
        </div>
      </DefaultMessageWithUser>
    );

  return (
    <div {...props}>
      <p>
        [位置共享] {message.from.remark ?? message.from.username}发起了位置共享)
      </p>
    </div>
  );
}
