import { ArrowRotateRightLeftLine } from "@/components/central-icon.tsx";
import Image from "@/components/image.tsx";
import Message from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { ControllerResult, MessageVM } from "@/lib/schema.ts";
import React, { useEffect } from "react";

import { format } from "date-fns";
import footer_logo from "/images/wrapped-2024/footer-logo.svg?url";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getDataAdapter } from "@/lib/adapter.ts";
import { Wrapped2024RandomMediaMessageQueryOptions } from "../fetchers.ts";
import { Route } from "@/routes/$accountId/chat/route.tsx";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account.ts";

export default function SectionSentMediaMessages({
  data,
}: {
  data: {
    startTime: Date;
    endTime: Date;
    sent_image_message_count: number;
    sent_video_message_count: number;
  };
}) {
  const { accountId } = Route.useParams();
  const { data: account } = useSuspenseQuery(
    AccountSuspenseQueryOptions(accountId),
  );

  const { startTime, endTime } = data;

  const { data: randomMediaMessages = [], isFetching } = useQuery({
    ...Wrapped2024RandomMediaMessageQueryOptions(),
  });

  const handleGetRandomMessages = () => {
    queryClient.invalidateQueries({
      queryKey: Wrapped2024RandomMediaMessageQueryOptions().queryKey,
    });
  };

  return (
    <section
      className="group p-8 h-[812px] flex flex-col gap-4 overflow-hidden"
      style={{
        background:
          "radial-gradient(66.67% 50% at 0% 100%, rgba(164, 253, 176, 0.5) 0%, rgba(255, 255, 255, 0) 100%), " +
          "#FAFAFA",
      }}
    >
      <div className={"h-40 -translate-y-0.5"}>
        <h2 className={"text-[2rem] font-medium text-black/90"}>发送图片</h2>
        <p className={"text-[28px] text-black/55"}>
          过去一年，你一共发送了{" "}
          {data.sent_image_message_count + data.sent_video_message_count}{" "}
          张图片和视频，还记得当时的心情吗
        </p>
      </div>
      <div className={"grow overflow-hidden drop-shadow-lg"}>
        <div className={"size-full"}>
          <div className={"h-full w-full"}>
            {randomMediaMessages
              .filter((_, index) => index < 1)
              .map((message) => (
                <div
                  key={`${message.chat.id}/${message.id}`}
                  className={"h-full w-full pb-8"}
                >
                  <Message
                    message={message}
                    // @ts-ignore
                    variant={"viewer_detail"}
                    className={
                      "h-full w-full flex justify-center items-center p-4 [&_img]:max-h-full [&_img]:max-w-full [&_img]:aspect-auto [&_img]:shadow-[0_0_0_8px_white] [&_video]:max-h-full [&_video]:max-w-full [&_video]:aspect-auto [&_video]:shadow-[0_0_0_8px_white]"
                    }
                  />
                  <p className={"mt-2 text-sm text-black/90"}>
                    <span>
                      {format(new Date(message.date * 1000), "MM月dd日")}
                    </span>
                    <span className={"mx-1"}>发送给</span>
                    {message.chat.type === "private" ? (
                      <User user={message.chat.user} variant="inline" />
                    ) : null}
                  </p>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className={"h-11 flex justify-between"}>
        <button
          type="button"
          className={
            "group-hover:opacity-100 flex items-center gap-1  text-black/65 [&_svg]:size-5 opacity-0 group-hover:opacity-100 transition-opacity"
          }
          onClick={() => {
            handleGetRandomMessages();
          }}
        >
          <ArrowRotateRightLeftLine
            className={isFetching ? "animate-spin" : ""}
          />
          换一张
        </button>
        <div className={"flex gap-2"}>
          <Image
            src={footer_logo}
            alt={"访问ohmywechat.com，查看微信报告2024"}
          />
          <User.Photo user={account} variant={"default"} />
        </div>
      </div>
    </section>
  );
}
