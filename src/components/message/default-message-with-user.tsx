import User from "@/components/user.tsx";
import type { Message } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";

interface DefaultMessageWithUserProps
  extends React.HTMLAttributes<HTMLDivElement> {
  message: Message;

  showPhoto?: boolean;
  showUsername?: boolean;
}

export default function DefaultMessageWithUser({
  message,
  showPhoto = true,
  showUsername = false,

  children,
}: DefaultMessageWithUserProps) {
  return (
    <div
      className={cn(
        "flex gap-x-3",
        ["flex-row-reverse ms-14", "flex-row me-14"][message.direction],
      )}
    >
      {showPhoto && <User.Photo variant="default" user={message.from} />}
      <div
        className={cn(
          "flex flex-col",
          ["items-end", "items-start"][message.direction],
        )}
      >
        {showUsername && (
          <User.Username
            variant="default"
            user={message.from}
            className={
              "mt-px mb-[7px] mx-0.5 text-[13px] leading-[14px] text-neutral-500"
            }
          />
        )}
        {children}
      </div>
    </div>
  );
}
