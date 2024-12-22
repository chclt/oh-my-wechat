import Image from "@/components/image.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import type { User } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import type React from "react";
import { useEffect } from "react";

interface ContactListProps
  extends Omit<React.HTMLAttributes<HTMLTableElement>, "onClick"> {
  onClick: (wxid: string) => void;
}

export default function ContactList({
  onClick,
  className,
  ...props
}: ContactListProps) {
  const [query, isQuerying, result, error] = useQuery<User[]>([]);

  useEffect(() => {
    query("/contacts");
  }, []);

  return (
    <ul>
      {result.map((i) => (
        <li
          key={i.id}
          className={cn("p-2.5 flex gap-4 hover:bg-black/5")}
          onClick={() => {
            console.log(i);
          }}
        >
          {i.photo ? (
            <div
              className={cn("shrink-0 w-12 h-12 rounded-lg overflow-hidden")}
            >
              <Image
                width={48}
                height={48}
                className={"w-full h-full"}
                src={i.photo.thumb}
              />
            </div>
          ) : (
            <div className={"shrink-0 w-12 h-12 rounded-lg bg-neutral-300"} />
          )}

          <div className="flex flex-col">
            <div className="flex">
              <h4 className={"grow font-medium break-all line-clamp-1"}>
                {i.remark ?? i.username}
              </h4>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
