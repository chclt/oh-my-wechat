import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Image from "@/components/image.tsx";
import MediaMessageList from "@/components/media-message-list.tsx";
import User from "@/components/user.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import type { Chat, ControllerPaginatorResult } from "@/lib/schema.ts";
import { cn } from "@/lib/utils.ts";
import { useEffect } from "react";

interface ChatDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  chat: Chat;
}

export default function ChatDetails({ chat, ...props }: ChatDetailsProps) {
  const [query, isQuerying, result, error] = useQuery<
    ControllerPaginatorResult<{ [key: string]: string }>
  >({
    data: {},
    meta: {},
  });

  useEffect(() => {
    query("/statistics", {
      chat,
    });
  }, [chat]);

  return (
    <div className={"mx-auto max-w-screen-sm"} {...props}>
      {/*<h2>{chat.title}</h2>*/}
      {chat.type === "private" && (
        <div className={"relative"}>
          <div
            className={cn("relative w-full pb-[120%]")}
            style={{
              background: `bottom / 100% 100% url('${chat.user.background}') no-repeat`,
            }}
          >
            <Image
              src={chat.user.background}
              alt={`${chat.user.remark ?? chat.user.username} 的朋友圈背景`}
              className={"absolute inset-0 w-full aspect-square object-cover"}
            />

            <Image
              src={chat.user.background}
              alt={`${chat.user.remark ?? chat.user.username} 的朋友圈背景`}
              className={"absolute inset-0 w-full h-full"}
              style={{
                mask: "linear-gradient(0deg, #000 17.5%, transparent 22.5% )",
              }}
            />
          </div>
          <div className={"absolute bottom-0 right-0 left-0 "}>
            <div className={"z-10 relative p-6 flex items-center"}>
              <Image
                src={chat.user.photo?.thumb}
                alt={`${chat.user.remark ?? chat.user.username} 的头像`}
                className={"size-20 rounded-xl"}
              />
              <div className={"ml-4 text-white/90"}>
                <h2 className={"text-xl font-medium tracking-tighter "}>
                  {chat.user.remark ?? chat.user.username}
                </h2>
                <p className={"mt-1.5 text-sm"}>{chat.user.bio}</p>
              </div>
            </div>
            <div
              className={
                "z-0 absolute -top-32 left-0 right-0 bottom-0 gradient-blur"
              }
            >
              {Array.from(new Array(6)).map(() => (
                <div />
              ))}
            </div>
          </div>
        </div>
      )}

      {chat.type === "chatroom" && (
        <div className={"relative"}>
          <div className={"p-6 flex flex-col items-center gap-6"}>
            <div
              className={
                " rounded-xl overflow-hidden relative after:content-[''] after:absolute after:inset-0 after:rounded-xl after:border-4 after:border-[#DDDFE0] after:pointer-events-none"
              }
            >
              <Image
                src={chat.chatroom.photo?.thumb}
                alt={`${chat.chatroom.remark ?? chat.chatroom.title} 的头像`}
                className={"size-20"}
              />
            </div>
            <div className={"text-foreground/90"}>
              <h2
                className={
                  "text-xl font-medium tracking-tighter text-center text-pretty"
                }
              >
                {chat.chatroom.remark ?? chat.chatroom.title}
              </h2>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="statistics" className={"mt-2 min-h-screen"}>
        <TabsList>
          {chat.type === "chatroom" && (
            <TabsTrigger value="members">成员</TabsTrigger>
          )}
          <TabsTrigger value="statistics">统计信息</TabsTrigger>
          <TabsTrigger value="medias">媒体</TabsTrigger>
        </TabsList>
        {chat.type === "chatroom" && (
          <TabsContent value="members">
            <div className={"p-2 flex flex-wrap [&>*]:basis-20 [&>*]:grow"}>
              {chat.chatroom.members.map((member) => (
                <User
                  key={member.id}
                  user={member}
                  className={cn(
                    "p-2 flex flex-col items-center gap-1",
                    "text-[13px] leading-tight text-center break-all text-neutral-600 [&_span]:line-clamp-1 text-pretty",
                    "[&_img]:w-full [&_img]:h-auto",
                  )}
                />
              ))}
              {Array.from(new Array(8)).map(() => (
                <i />
              ))}
            </div>
          </TabsContent>
        )}
        <TabsContent value="statistics">
          <div className={"p-4 space-y-2"}>
            {/* {Object.keys(result.data).map((key) => (
              <div key={key}>
                <h4 className={"font-semibold"}>{key}</h4>
                <p>{result.data[key]}</p>
              </div>
            ))} */}
          </div>
        </TabsContent>
        <TabsContent value="medias">
          <MediaMessageList chat={chat} isChatroom={chat.type === "chatroom"} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
