import Image from "@/components/image.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import WechatEmojiTable from "@/lib/wechat-emojis.ts";
import type React from "react";

import footer_logo from "/images/wrapped-2024/footer-logo.svg?url";
import { Route } from "@/routes/$accountId/chat/route";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account";

export default function SectionMostUsedWxemoji({
  data,
}: {
  data: {
    sent_wxemoji_usage: { key: string; count: number }[];
  };
}) {
  const { accountId } = Route.useParams();
  const { data: account } = useSuspenseQuery(
    AccountSuspenseQueryOptions(accountId),
  );

  const mostUsedWxemoji = data.sent_wxemoji_usage.sort(
    (a, b) => b.count - a.count,
  )[0];
  const mostUsedWxemojiKey = mostUsedWxemoji ? mostUsedWxemoji.key : undefined;
  const mostUsedWxemojiSrc = mostUsedWxemojiKey
    ? `/wxemoji/${WechatEmojiTable[mostUsedWxemojiKey]}`
    : undefined;

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
        <h2 className={"text-[2rem] font-medium text-black/90"}>发送表情</h2>
        <p className={"text-[28px] text-black/55"}>
          过去一年，你使用最多的微信表情是
        </p>
      </div>
      <div className={"grow"}>
        <div className={"h-[336px] flex items-center"}>
          <div
            className={"w-full p-[2.875rem] flex flex-col items-center gap-8"}
          >
            {mostUsedWxemoji && (
              <div className={"mt-4 relative size-24 [&_img]:size-full"}>
                <Image
                  src={mostUsedWxemojiSrc}
                  alt={mostUsedWxemojiKey}
                  className={"absolute z-0 inset-0 blur-xl opacity-50"}
                  aria-hidden
                />
                <Image
                  src={mostUsedWxemojiSrc}
                  alt={mostUsedWxemojiKey}
                  className={"relative"}
                />
              </div>
            )}

            {mostUsedWxemoji && (
              <p
                className={"text-[2rem] text-center font-medium text-black/90"}
              >
                累计使用 {mostUsedWxemoji.count} 次
              </p>
            )}
          </div>
        </div>
      </div>
      <div className={"h-11 flex justify-end"}>
        <div className={"flex gap-2"}>
          <Image
            src={footer_logo}
            alt={"访问ohmywechat.com，查看微信报告2024"}
          />
          <User.Photo user={account!} variant={"default"} />
        </div>{" "}
      </div>
    </section>
  );
}
