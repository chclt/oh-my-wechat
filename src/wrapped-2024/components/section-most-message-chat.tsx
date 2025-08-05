import Image from "@/components/image.tsx";
import { ScrollArea } from "@/components/ui/scroll-area.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { Chat } from "@/lib/schema.ts";
import type React from "react";

import footer_logo from "/images/wrapped-2024/footer-logo.svg?url";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account";
import { Route } from "@/routes/$accountId/chat/route";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function SectionMostMessageChat({
  data,
}: {
  data: {
    message_count: number;
    chat_message_count: {
      chat: Chat;
      message_count: number;
      sent_message_count: number;
      received_message_count: number;
    }[];
  };
}) {
  const { accountId } = Route.useParams();
  const { data: account } = useSuspenseQuery(
    AccountSuspenseQueryOptions(accountId),
  );

  const messageCountMax = data.chat_message_count.length
    ? data.chat_message_count[0].message_count
    : 0;

  return (
    <section
      className="p-8 h-[812px] flex flex-col gap-4"
      style={{
        background:
          "radial-gradient(66.67% 50% at 0% 100%, rgba(164, 253, 176, 0.5) 0%, rgba(255, 255, 255, 0) 100%), " +
          "#FAFAFA",
      }}
    >
      <div className={"h-40 -translate-y-0.5"}>
        <h2 className={"text-[2rem] font-medium text-black/90"}>最多联系</h2>
        <p className={"text-[28px] text-black/55"}>
          过去一年，你与 {data.chat_message_count.length} 位朋友互相发送了{" "}
          {data.message_count} 条消息
        </p>
      </div>
      <div className={"grow"}>
        <ScrollArea className={"h-[512px]"}>
          <ul className={"flex flex-col gap-6"}>
            {data.chat_message_count.map((i) => (
              <li key={i.chat.title} className={"flex gap-2.5"}>
                {i.chat.type === "private" && (
                  <User.Photo
                    user={i.chat.user}
                    className={"shrink-0"}
                    variant="default"
                  />
                )}
                {i.chat.type === "chatroom" && (
                  <div
                    className={
                      "rounded-[18.18%] clothoid-corner-[18.18%] overflow-hidden relative after:content-[''] after:absolute after:inset-0 after:rounded-[18.18%] after:border-2 after:border-[#DDDFE0] after:pointer-events-none"
                    }
                  >
                    <Image
                      src={i.chat.chatroom.photo?.thumb}
                      alt={`${i.chat.chatroom.remark ?? i.chat.chatroom.title} 的头像`}
                      className={"size-11"}
                    />
                  </div>
                )}
                <div className={"grow flex flex-col gap-2.5"}>
                  <div className={"flex gap-2.5"}>
                    <h4>
                      {i.chat.type === "private" && (
                        <User.Username
                          user={i.chat.user}
                          className={"shrink-0"}
                          variant="default"
                        />
                      )}

                      {i.chat.type === "chatroom" &&
                        (i.chat.chatroom.remark ?? i.chat.chatroom.title)}
                    </h4>
                    <span className={"text-black/45"}>
                      发送 {i.sent_message_count}条 接收{" "}
                      {i.received_message_count}条
                    </span>
                  </div>

                  <div className={"self-stretch "}>
                    <div
                      className={"h-2 rounded-full bg-green-400"}
                      style={{
                        width: `${(i.message_count / messageCountMax) * 100}%`,
                        background: `linear-gradient(90deg, #7FF960 ${(i.sent_message_count / i.message_count) * 100}%, #FFB86C ${(i.sent_message_count / i.message_count) * 100}%)`,
                      }}
                    ></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
      <div className={"h-11 flex justify-end"}>
        <div className={"flex gap-2"}>
          <Image
            src={footer_logo}
            alt={"访问ohmywechat.com，查看微信报告2024"}
          />
          <User.Photo user={account!} variant={"default"} />
        </div>
      </div>
    </section>
  );
}
