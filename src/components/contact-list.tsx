import Image from "@/components/image.tsx";
import { useApp } from "@/lib/hooks/appProvider";
import useQuery from "@/lib/hooks/useQuery.ts";
import type { Chat, Chatroom, ControllerResult, User } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import type React from "react";
import { useEffect } from "react";

interface ContactListProps extends React.HTMLAttributes<HTMLUListElement> {}

export default function ContactList({ className, ...props }: ContactListProps) {
  const [query, isQuerying, result, error] = useQuery<ControllerResult<User[]>>(
    {
      data: [],
    },
  );

  useEffect(() => {
    query("/contacts");
  }, []);

  return (
    <ul className={cn(className)} {...props}>
      {result.data.map((contact) => (
        <ContactItem key={contact.id} contact={contact} />
      ))}
    </ul>
  );
}

interface ContactItemProps extends React.HTMLAttributes<HTMLLIElement> {
  contact: User | Chatroom;
}

export function ContactItem({
  contact,

  className,
  ...props
}: ContactItemProps) {
  const { setChat } = useApp();

  const [query, isQuerying, result, error] = useQuery<ControllerResult<Chat[]>>(
    {
      data: [],
    },
  );

  useEffect(() => {
    query("/chats/in", {
      ids: [contact.id],
    });
  }, [contact.id]);

  return (
    <li
      className={cn("p-2.5 flex gap-4 hover:bg-black/5", className)}
      {...props}
    >
      {contact.photo ? (
        <div className={cn("shrink-0 w-12 h-12 rounded-lg overflow-hidden")}>
          <Image
            width={48}
            height={48}
            className={"w-full h-full"}
            src={contact.photo.thumb}
          />
        </div>
      ) : (
        <div className={"shrink-0 w-12 h-12 rounded-lg bg-neutral-300"} />
      )}

      <div className="flex flex-col">
        <div className="flex">
          <h4 className={"grow font-medium break-all line-clamp-1"}>
            {/* @ts-ignore */}
            {contact.remark ?? contact.username ?? contact.title}
            {contact.is_openim && (
              <span className="ms-1 text-sm font-normal text-orange-400">
                @企业微信
              </span>
            )}
          </h4>
        </div>
      </div>
    </li>
  );
}
