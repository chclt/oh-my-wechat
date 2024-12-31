import {
  DailyMessageCountChart,
  type DailyMessageCountChartProps,
} from "@/components/statistic/wrapped-2024/daily-message-count-chart.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type React from "react";

export default function SectionMessageCountDescription({
  data,
}: {
  data: {
    message_count_description: string;
  };
}) {
  const { user } = useApp();

  return (
    <section className="p-8 h-[812px] flex flex-col gap-4">
      <div className={"h-40 -translate-y-0.5"} />
      <div className={"grow"}>
        <div className={"h-[336px] flex items-center"}>
          <p className={"p-[2.875rem] text-[2rem] font-medium text-black/90"}>
            读完过去一年的所有消息
            <br />
            你的手指需要滑动
            <br />
            {data.message_count_description}
          </p>
        </div>
      </div>
      <div className={"h-11 flex justify-end"}>
        <User.Photo user={user!} variant={"default"} />
      </div>
    </section>
  );
}
