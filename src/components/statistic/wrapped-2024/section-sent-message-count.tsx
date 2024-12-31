import { DailyMessageCountChart } from "@/components/statistic/wrapped-2024/daily-message-count-chart.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import { differenceInMonths, format } from "date-fns";
import React from "react";

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
  const { user } = useApp();

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
    <section className="p-8 h-[812px] flex flex-col gap-4">
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
        <User.Photo user={user!} variant={"default"} />
      </div>
    </section>
  );
}