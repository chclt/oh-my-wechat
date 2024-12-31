import { ArrowRotateRightLeftLine } from "@/components/central-icon.tsx";
import Message from "@/components/message/message.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";
import type { ControllerResult, MessageVM } from "@/lib/schema.ts";
import React, { useEffect } from "react";

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
  const { user } = useApp();

  const { startTime, endTime } = data;

  const [query, isQuerying, result, error] = useQuery<
    ControllerResult<MessageVM[]>
  >({
    data: [],
  });

  const handleGetRandomMessages = () => {
    query("/wrapped/messages/media/random", {
      startTime,
      endTime,
    });
  };

  useEffect(() => {
    handleGetRandomMessages();
  }, []);

  return (
    <section className="group p-8 h-[812px] flex flex-col gap-4 overflow-hidden">
      <div className={"h-40 -translate-y-0.5"}>
        <h2 className={"text-[2rem] font-medium text-black/90"}>发送图片</h2>
        <p className={"text-[28px] text-black/55"}>
          过去一年，你一共发送了{" "}
          {data.sent_image_message_count + data.sent_video_message_count}{" "}
          张图片和视频，还记得当时的心情吗
        </p>
      </div>
      <div className={"-mr-8  grow overflow-hidden"}>
        <div className={"h-full grid grid-rows-3 gap-4"}>
          <div className={"flex gap-4"}>
            {result.data
              .filter((_, index) => index < 7)
              .map((message) => (
                <div
                  key={`${message.chat.id}/${message.id}`}
                  className={"shrink-0 p-2 h-full bg-white shadow-lg"}
                >
                  <Message
                    message={message}
                    // @ts-ignore
                    variant={"viewer_detail"}
                    className={
                      "h-full [&_img]:h-full [&_img]:w-auto [&_video]:h-full [&_video]:w-auto"
                    }
                  />
                </div>
              ))}
          </div>
          <div className={"flex gap-4 overflow-hidden"}>
            {result.data
              .filter((_, index) => index >= 7 && index < 14)
              .map((message) => (
                <div
                  key={`${message.chat.id}/${message.id}`}
                  className={"shrink-0 p-2 h-full bg-white shadow-lg"}
                >
                  <Message
                    message={message}
                    // @ts-ignore
                    variant={"viewer_detail"}
                    className={
                      "h-full [&_img]:h-full [&_img]:w-auto [&_video]:h-full [&_video]:w-auto"
                    }
                  />
                </div>
              ))}
          </div>
          <div className={"flex gap-4 overflow-hidden"}>
            {result.data
              .filter((_, index) => index >= 14 && index < 21)
              .map((message) => (
                <div
                  key={`${message.chat.id}/${message.id}`}
                  className={"shrink-0 p-2 h-full bg-white shadow-lg"}
                >
                  <Message
                    message={message}
                    // @ts-ignore
                    variant={"viewer_detail"}
                    className={
                      "h-full [&_img]:h-full [&_img]:w-auto [&_video]:h-full [&_video]:w-auto"
                    }
                  />
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
            className={isQuerying ? "animate-spin" : ""}
          />
          换一组
        </button>
        <User.Photo user={user!} variant={"default"} />
      </div>
    </section>
  );
}
