import Image from "@/components/image.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type React from "react";

import footer_logo from "/images/wrapped-2024/footer-logo.svg?url";

export default function SectionSentMessageCountDescription({
  data,
}: {
  data: {
    sent_message_count_description: string;
  };
}) {
  const { user } = useApp();

  return (
    <section
      className="p-8 h-[812px] flex flex-col gap-4"
      style={{
        background:
          "radial-gradient(66.67% 50% at 0% 100%, rgba(164, 253, 176, 0.5) 0%, rgba(255, 255, 255, 0) 100%), " +
          "#FAFAFA",
      }}
    >
      <div className={"h-40 -translate-y-0.5"} />
      <div className={"grow"}>
        <div className={"h-[336px] flex items-center"}>
          <p className={"p-[2.875rem] text-[2rem] font-medium text-black/90"}>
            发送过去一年的所有消息
            <br />
            你需要消耗能量 {data.sent_message_count_description} 卡
            <br />
          </p>
        </div>
      </div>
      <div className={"h-11 flex justify-end"}>
        <div className={"flex gap-2"}>
          <Image
            src={footer_logo}
            alt={"访问ohmywechat.com，查看微信报告2024"}
          />
          <User.Photo user={user!} variant={"default"} />
        </div>
      </div>
    </section>
  );
}
