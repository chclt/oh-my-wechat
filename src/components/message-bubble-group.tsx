import User from "@/components/user.tsx";
import type { User as UserVM } from "@/lib/schema.ts";

import _global from "@/lib/global.ts";
import type { Message as MessageVM } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import { ErrorBoundary } from "react-error-boundary";
import Message from "./message/message.tsx";

interface BubbleGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  user: UserVM;
  messages: MessageVM[];

  showPhoto?: boolean;
  showUsername?: boolean;
}

export function MessageBubbleGroup({
  user,
  messages,
  showPhoto = true,
  showUsername = false,

  className,
  ...props
}: BubbleGroupProps) {
  return (
    <ErrorBoundary
      fallback={
        <div
          onDoubleClick={() => {
            if (_global.enableDebug) console.log(messages);
          }}
        >
          解析失败：消息组
        </div>
      }
    >
      <div
        className={cn(
          "flex gap-x-3",
          ["flex-row-reverse ms-14", "flex-row me-14"][messages[0].direction],
        )}
      >
        {showPhoto && (
          <User.Photo
            variant="default"
            user={user}
            className={"sticky top-20"}
          />
        )}
        <div
          className={cn(
            "flex flex-col",
            ["items-end", "items-start"][messages[0].direction],
          )}
        >
          {showUsername && (
            <User.Username
              variant="default"
              user={user}
              className={
                "mt-px mb-[7px] mx-0.5 text-[13px] leading-[14px] text-neutral-500"
              }
            />
          )}
          <div
            className={cn(
              "flex flex-col gap-2",
              ["items-end", "items-start"][messages[0].direction],
              "[&>*:nth-child(n+2).bubble-tail-l]:bubble-tail-none [&>*:nth-child(n+2).bubble-tail-r]:bubble-tail-none",
              className,
            )}
            {...props}
          >
            {messages.map((message, index) => (
              <Message key={`(${index})${message.id}`} message={message} />
            ))}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
