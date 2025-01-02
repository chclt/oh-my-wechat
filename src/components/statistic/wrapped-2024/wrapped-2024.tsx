import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel.tsx";
import useQuery from "@/lib/hooks/useQuery.ts";

import type React from "react";
import { useState } from "react";
import { useEffect } from "react";

import type { ChatStatistics } from "@/lib/controllers/statistic.ts";
import type { ControllerResult } from "@/lib/schema.ts";
import Fade from "embla-carousel-fade";

import cover_logo from "@/assets/images/wrapped-2024/cover-logo.svg";
import { ChevronRightSmallLine } from "@/components/central-icon.tsx";
import Image from "@/components/image.tsx";
import SectionMessageCountDescription from "@/components/statistic/wrapped-2024/section-message-count-description.tsx";
import SectionMostMessageChat from "@/components/statistic/wrapped-2024/section-most-message-chat.tsx";
import SectionMostUsedWxemoji from "@/components/statistic/wrapped-2024/section-most-used-wxemoji.tsx";
import SectionNewUserAdded from "@/components/statistic/wrapped-2024/section-new-user-added.tsx";
import SectionSentMediaMessages from "@/components/statistic/wrapped-2024/section-sent-media-messages.tsx";
import SectionSentMessageCountDescription from "@/components/statistic/wrapped-2024/section-sent-message-count-description.tsx";
import SectionSentMessageCount from "@/components/statistic/wrapped-2024/section-sent-message-count.tsx";
import SectionSentMessageWordCount from "@/components/statistic/wrapped-2024/section-sent-message-word-count.tsx";
import SectionSummary from "@/components/statistic/wrapped-2024/section-summary.tsx";
import type { Wrapped2024Statistics } from "@/lib/controllers/wrapped-2024.ts";
import { LoaderIcon } from "lucide-react";

interface ReportProps extends React.HTMLAttributes<HTMLDivElement> {
  startTime: Date;
  endTime: Date;
}

export default function Wrapped2024({
  startTime,
  endTime,
  className,
}: ReportProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const [query, isQuerying, result, error] = useQuery<
    ControllerResult<Wrapped2024Statistics>
  >({
    data: {},
  });

  useEffect(() => {
    if (Object.keys(result.data).length) {
      setQueried(true);
      if (carouselApi) {
        carouselApi.scrollNext();
      }
    }
  }, [result]);

  const [queried, setQueried] = useState<boolean>(false);

  const [windowSize, setWindowSize] = useState<{
    width?: number;
    height?: number;
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let canvasScale = 1;

  if (windowSize.width && windowSize.height) {
    const windowRatio = windowSize.width / windowSize.height;
    if (windowRatio > 600 / 812) {
      // wider
      canvasScale = (windowSize.height / 812) * 0.9;
    } else {
      canvasScale = (windowSize.width / 600) * 0.9;
    }
  }

  return (
    <div className={"flex items-center justify-center"}>
      <div
        className={"relative w-[600px] h-[812px]"}
        style={{
          transform: `scale(${canvasScale})`,
        }}
      >
        <Carousel
          setApi={setCarouselApi}
          className="absolute inset-0"
          plugins={[Fade()]}
        >
          <CarouselContent>
            <CarouselItem className={"pl-4"}>
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
                  <div
                    className={
                      "h-[160px] flex flex-col justify-end items-center"
                    }
                  >
                    <Image src={cover_logo} alt={"微信报告2024"} />
                  </div>

                  <div
                    className={
                      "mt-4 h-[160px] pt-12 flex flex-col justify-start items-center"
                    }
                  >
                    <button
                      type="button"
                      className={
                        "group -mr-2.5 -mb-2.5 pl-4 pr-2 py-2 flex gap-1.5 items-center bg-transparent shadow-none"
                      }
                      onClick={() => {
                        if (!isQuerying && !queried) {
                          query("/wrapped/2024", {
                            startTime,
                            endTime,
                          });
                        }

                        if (!isQuerying && queried) {
                          carouselApi?.scrollNext?.();
                        }
                      }}
                    >
                      开始
                      {isQuerying ? (
                        <LoaderIcon className={"size-5 animate-spin"} />
                      ) : (
                        <ChevronRightSmallLine
                          className={
                            "size-5 group-hover:translate-x-0.5 transition-transform"
                          }
                        />
                      )}
                    </button>
                  </div>
                </div>
              </section>
            </CarouselItem>

            <CarouselItem className={"pl-4"}>
              {result.data.sent_message_count !== undefined &&
                result.data.daily_sent_message_count &&
                result.data.daily_received_message_count && (
                  <SectionSentMessageCount
                    data={{
                      startTime,
                      endTime,
                      sent_message_count: result.data.sent_message_count,
                      daily_sent_message_count:
                        result.data.daily_sent_message_count,
                      daily_received_message_count:
                        result.data.daily_received_message_count,
                    }}
                  />
                )}
            </CarouselItem>

            <CarouselItem className={"pl-4"}>
              {result.data.sent_message_word_count !== undefined &&
                result.data.sent_message_word_count_description !==
                  undefined && (
                  <SectionSentMessageWordCount
                    data={{
                      sent_message_word_count:
                        result.data.sent_message_word_count,
                      sent_message_word_count_description:
                        result.data.sent_message_word_count_description,
                    }}
                  />
                )}
            </CarouselItem>

            <CarouselItem className={"pl-4"}>
              {result.data.sent_image_message_count !== undefined &&
                result.data.sent_video_message_count !== undefined && (
                  <SectionSentMediaMessages
                    data={{
                      startTime,
                      endTime,
                      sent_image_message_count:
                        result.data.sent_image_message_count,
                      sent_video_message_count:
                        result.data.sent_video_message_count,
                    }}
                  />
                )}
            </CarouselItem>

            <CarouselItem className={"pl-4"}>
              {result.data.sent_wxemoji_usage && (
                <SectionMostUsedWxemoji
                  data={{
                    sent_wxemoji_usage: result.data.sent_wxemoji_usage,
                  }}
                />
              )}
            </CarouselItem>

            {/*
            <CarouselItem className={"pl-4"}>
              {result.data.sent_message_count_description && (
                <SectionSentMessageCountDescription
                  data={{
                    sent_message_count_description:
                      result.data.sent_message_count_description,
                  }}
                />
              )}
            </CarouselItem>
            */}

            <CarouselItem className={"pl-4"}>
              {result.data.message_count !== undefined &&
                result.data.chat_message_count && (
                  <SectionMostMessageChat
                    data={{
                      message_count: result.data.message_count,
                      chat_message_count: result.data.chat_message_count.filter(
                        (i) => i.message_count > 0,
                      ),
                    }}
                  />
                )}
            </CarouselItem>

            <CarouselItem className={"pl-4"}>
              {result.data.user_dates_contact_added && (
                <SectionNewUserAdded
                  data={{
                    user_dates_contact_added:
                      result.data.user_dates_contact_added.filter(
                        (i) =>
                          new Date(i.date) > startTime &&
                          new Date(i.date) < endTime,
                      ),
                  }}
                />
              )}
            </CarouselItem>

            {/*
            <CarouselItem className={"pl-4"}>
              {result.data.message_count_description && (
                <SectionMessageCountDescription
                  data={{
                    message_count_description:
                      result.data.message_count_description,
                  }}
                />
              )}
            </CarouselItem>
            */}

            <CarouselItem className={"pl-4"}>
              {result.data.sent_message_count !== undefined &&
                result.data.sent_message_word_count !== undefined &&
                result.data.sent_image_message_count !== undefined &&
                result.data.sent_video_message_count !== undefined &&
                result.data.sent_sticker_message_count !== undefined &&
                result.data.sent_voice_message_total_duration !== undefined &&
                result.data.sent_music_message_count !== undefined &&
                result.data.sent_wxemoji_usage &&
                result.data.chat_message_count &&
                result.data.user_dates_contact_added && (
                  <SectionSummary
                    data={{
                      sent_message_count: result.data.sent_message_count,
                      sent_message_word_count:
                        result.data.sent_message_word_count,
                      sent_image_message_count:
                        result.data.sent_image_message_count,
                      sent_video_message_count:
                        result.data.sent_video_message_count,
                      sent_sticker_message_count:
                        result.data.sent_sticker_message_count,
                      sent_voice_message_total_duration:
                        result.data.sent_voice_message_total_duration,
                      sent_music_message_count:
                        result.data.sent_music_message_count,
                      sent_wxemoji_usage: result.data.sent_wxemoji_usage,
                      chat_message_count: result.data.chat_message_count.filter(
                        (i) => i.message_count > 0,
                      ),
                      user_dates_contact_added:
                        result.data.user_dates_contact_added.filter(
                          (i) =>
                            new Date(i.date) > startTime &&
                            new Date(i.date) < endTime,
                        ),
                    }}
                  />
                )}
            </CarouselItem>
          </CarouselContent>
          {queried && (
            <>
              <CarouselPrevious className={"shadow-none"} />
              <CarouselNext className={"shadow-none"} />
            </>
          )}
        </Carousel>
      </div>
    </div>
  );
}
