import Image from "@/components/image.tsx";
import { DailyMessageCountChart } from "./daily-message-count-chart.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import { differenceInMonths, format } from "date-fns";
import React from "react";

import footer_logo from "/images/wrapped-2024/footer-logo.svg?url";
import { Route } from "@/routes/$accountId/chat/index.tsx";
import { useSuspenseQueries, useSuspenseQuery } from "@tanstack/react-query";
import {
  AccountListSuspenseQueryOptions,
  AccountSuspenseQueryOptions,
} from "@/lib/fetchers/account.ts";

export default function SectionSentMessageCount({
  data,
}: {
  data: {
    startTime: Date;
    endTime: Date;
    sent_message_count: number;
    daily_sent_message_count: { date: string; message_count: number }[];
    daily_received_message_count: { date: string; message_count: number }[];
  };
}) {
  const { accountId } = Route.useParams();
  const { data: account } = useSuspenseQuery(
    AccountSuspenseQueryOptions(accountId),
  );

  const { startTime, endTime } = data;

  const combinedDate = Array.from(
    new Array(differenceInMonths(endTime, startTime)),
  ).map((_, i) => ({
    date: `${(i + 1).toString()}月`,
    sent_message_count: 0,
    received_message_count: 0,
  }));

  data.daily_sent_message_count.map((i) => {
    const monthIndex = Number.parseInt(format(new Date(i.date), "MM")) - 1;
    combinedDate[monthIndex].sent_message_count += i.message_count;
  });

  data.daily_received_message_count.map((i) => {
    const monthIndex = Number.parseInt(format(new Date(i.date), "MM")) - 1;
    combinedDate[monthIndex].received_message_count += i.message_count;
  });

  return (
    <section
      className="p-8 h-[812px] flex flex-col gap-4"
      style={{
        background:
          "radial-gradient(66.67% 50% at 0% 100%, rgba(164, 253, 176, 0.5) 0%, rgba(255, 255, 255, 0) 100%), " +
          "#FAFAFA",
      }}
    >
      <div className={"-translate-y-0.5"}>
        <h2 className={"text-[2rem] font-medium text-black/90"}>消息统计</h2>
        <p className={"text-[28px] text-black/55"}>
          过去一年，你一共发送了 {data.sent_message_count} 条消息
        </p>
      </div>
      <div className={"grow"}>
        <DailyMessageCountChart data={combinedDate} className={"size-full"} />
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
