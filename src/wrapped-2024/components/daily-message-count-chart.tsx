import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart.tsx";
import type React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

export interface DailyMessageCountChartProps
  extends React.HTMLAttributes<HTMLDivElement> {
  data: {
    date: string;
    sent_message_count: number;
    received_message_count: number;
  }[];
}

const chartConfig = {
  sent_message_count: {
    label: "发送消息",
    color: "#26DC22",
  },
  received_message_count: {
    label: "接受消息",
    color: "#FFB75C",
  },
} satisfies ChartConfig;

export function DailyMessageCountChart({
  data,
  ...props
}: DailyMessageCountChartProps) {
  return (
    <ChartContainer config={chartConfig} {...props}>
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="fillReceived" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-received_message_count)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-received_message_count)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillSent" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-sent_message_count)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-sent_message_count)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>

        <Area
          dataKey="sent_message_count"
          type="bump"
          fill="url(#fillSent)"
          fillOpacity={0.4}
          stroke="var(--color-sent_message_count)"
          strokeWidth={6}
          strokeLinecap="round"
          stackId="a"
        />
        <Area
          dataKey="received_message_count"
          type="bump"
          fill="url(#fillReceived)"
          fillOpacity={0.4}
          stroke="var(--color-received_message_count)"
          strokeWidth={6}
          strokeLinecap="round"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
