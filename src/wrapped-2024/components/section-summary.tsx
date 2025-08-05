import Image from "@/components/image.tsx";
import User from "@/components/user.tsx";
import { useApp } from "@/lib/hooks/appProvider.tsx";
import type { Chat, User as UserVM } from "@/lib/schema.ts";
import WechatEmojiTable from "@/lib/wechat-emojis.ts";
import type React from "react";

import message_background from "/images/wrapped-2024/widget-message-background.png?url";
import music_background from "/images/wrapped-2024/widget-music-background.png?url";
import widget_friends_background from "/images/wrapped-2024/widget-new-friends-background.png?url";
import voice_background from "/images/wrapped-2024/widget-voice-background.png?url";

import footer_logo from "/images/wrapped-2024/footer-logo.svg?url";
import { Route } from "@/routes/$accountId/chat/route";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AccountSuspenseQueryOptions } from "@/lib/fetchers/account";

export default function SectionSummary({
  data,
}: {
  data: {
    sent_message_count: number;
    sent_message_word_count: number;
    sent_image_message_count: number;
    sent_video_message_count: number;
    sent_sticker_message_count: number;
    sent_voice_message_total_duration: number;
    sent_music_message_count: number;
    sent_wxemoji_usage: { key: string; count: number }[];
    chat_message_count: { chat: Chat; message_count: number }[];
    user_dates_contact_added: { user: UserVM; date: string }[];
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

  let voiceDurationDisplay = `${Math.round(
    data.sent_voice_message_total_duration,
  )}秒`;
  if (data.sent_voice_message_total_duration > 10000) {
    const m = (data.sent_voice_message_total_duration / 60) | 0;
    const s = Math.round(data.sent_voice_message_total_duration % 60);
    voiceDurationDisplay = `${m} 分 ${s} 秒`;
  }

  return (
    <section
      className="p-8 h-[812px] flex flex-col gap-4"
      style={{
        background:
          "radial-gradient(66.67% 50% at 0% 100%, rgba(164, 253, 176, 0.5) 0%, rgba(255, 255, 255, 0) 100%), " +
          "#FAFAFA",
      }}
    >
      <div
        className={"grow grid grid-cols-12 grid-rows-4 gap-4"}
        style={{
          filter: "drop-shadow(0px 0px 0.5px rgba(0, 0, 0, 0.15))",
        }}
      >
        <div
          className={
            "col-span-6 p-4 flex flex-col justify-center items-center bg-white/95 rounded-3xl overflow-hidden clothoid-corner-6"
          }
        >
          <div className={"relative size-12 [&_svg]:size-full"}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={"z-10 relative"}
              style={{
                filter: "drop-shadow(0px 0px 32px rgba(11, 184, 95, 1))",
              }}
            >
              <path
                d="M24 39.6024C35.0457 39.6024 44 31.9913 44 22.6024C44 13.2136 35.0457 5.60242 24 5.60242C12.9543 5.60242 4 13.2136 4 22.6024C4 26.4369 5.49354 29.9748 8.01311 32.8189C9.20497 34.1642 9.8009 34.8369 10.0325 35.2913C10.2862 35.7892 10.359 36.0226 10.4332 36.5765C10.501 37.0819 10.425 37.7097 10.273 38.9653L10.2571 39.0974C10.126 40.1804 10.0605 40.7219 10.25 41.0625C10.4154 41.3597 10.699 41.5727 11.0304 41.6487C11.4104 41.7358 11.9121 41.522 12.9157 41.0945L16.1451 39.7186C16.8629 39.4127 17.2218 39.2598 17.55 39.1814C17.8912 39.0999 18.0885 39.0757 18.4393 39.0722C18.7767 39.0688 19.2793 39.1491 20.2845 39.3096C21.4885 39.5019 22.7304 39.6024 24 39.6024Z"
                fill="url(#paint0_linear_524_297)"
                fillOpacity="0.9"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_524_297"
                  x1="24"
                  y1="5.60242"
                  x2="24"
                  y2="42.3973"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#40DA8C" />
                  <stop offset="1" stopColor="#03C160" />
                </linearGradient>
              </defs>
            </svg>
            <div
              className={
                "z-0 absolute top-3 right-0 bottom-0 left-0 grid place-content-center pointer-events-none"
              }
            >
              <div
                style={{
                  width: 197,
                  height: 180,
                  background: ` center / cover no-repeat url(${message_background})`,
                }}
              />
            </div>
          </div>

          <span
            className={
              "-mt-1 text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            {data.sent_message_count}
          </span>
          <h4
            className={
              "-mt-1 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            发送消息数量
          </h4>
        </div>
        <div
          className={
            "col-span-6 p-4 flex flex-col justify-center items-center bg-white/95 rounded-3xl overflow-hidden clothoid-corner-6"
          }
        >
          <div className={"relative size-12 [&_svg]:size-full"}>
            <svg
              width="48"
              height="49"
              viewBox="0 0 48 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.65396 7.77606C4 9.05953 4 10.7397 4 14.1V34.9C4 38.2603 4 39.9405 4.65396 41.2239C5.2292 42.3529 6.14708 43.2708 7.27606 43.846C8.55953 44.5 10.2397 44.5 13.6 44.5H34.4C37.7603 44.5 39.4405 44.5 40.7239 43.846C41.8529 43.2708 42.7708 42.3529 43.346 41.2239C44 39.9405 44 38.2603 44 34.9V14.1C44 10.7397 44 9.05953 43.346 7.77606C42.7708 6.64708 41.8529 5.7292 40.7239 5.15396C39.4405 4.5 37.7603 4.5 34.4 4.5H13.6C10.2397 4.5 8.55953 4.5 7.27606 5.15396C6.14708 5.7292 5.2292 6.64708 4.65396 7.77606ZM16.124 29.712C14.9107 31.1307 13.4547 32.4467 11.756 33.66L13.996 36.18C16.124 34.556 17.8413 32.8293 19.148 31C20.4547 29.1707 21.4907 27.22 22.256 25.148V22.348H12.988V25.288H19.008C18.2987 26.8 17.3373 28.2747 16.124 29.712ZM26.708 16.86H15.06V19.772H23.628V33.156C23.628 33.604 23.5907 33.9307 23.516 34.136C23.46 34.3227 23.32 34.444 23.096 34.5C22.8907 34.5747 22.5453 34.612 22.06 34.612C21.332 34.6307 20.4547 34.5933 19.428 34.5L19.988 37.664C21.1453 37.7013 22.284 37.6547 23.404 37.524C24.2253 37.4493 24.8693 37.2907 25.336 37.048C25.8213 36.8053 26.1667 36.432 26.372 35.928C26.596 35.4427 26.708 34.7613 26.708 33.884V26.2328C27.2991 27.2457 27.9524 28.2281 28.668 29.18C30.6467 31.7933 33.0173 34.0707 35.78 36.012L37.824 33.268C34.8187 31.2893 32.336 29.0027 30.376 26.408C30.1341 26.0877 29.8988 25.7614 29.6703 25.4289C30.5379 24.8165 31.5105 24.0415 32.588 23.104C34.1933 21.7227 35.36 20.6213 36.088 19.8L33.792 17.504C33.064 18.3627 31.9533 19.4827 30.46 20.864C29.6256 21.6237 28.8369 22.2836 28.094 22.8439C27.587 21.9027 27.125 20.9205 26.708 19.897V16.86ZM25.588 12.604C23.7213 11.8947 22.2187 11.4187 21.08 11.176L20.044 13.892C21.0333 14.116 22.4893 14.592 24.412 15.32C26.1853 15.992 27.5853 16.608 28.612 17.168L29.872 14.368C29.032 13.92 27.604 13.332 25.588 12.604Z"
                fill="url(#paint0_linear_526_350)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_526_350"
                  x1="24"
                  y1="4.5"
                  x2="24"
                  y2="44.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#565656" />
                  <stop offset="1" stopColor="#1B1B1B" />
                </linearGradient>
              </defs>
            </svg>

            <Image src={""} />
          </div>

          <span
            className={
              "-mt-1 text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            {data.sent_message_word_count}
          </span>
          <h4
            className={
              "-mt-1 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            发送消息字数
          </h4>
        </div>
        <div
          className={
            "col-span-4 p-4 flex flex-col justify-center items-center bg-white/95 rounded-3xl overflow-hidden clothoid-corner-6"
          }
        >
          <div className={"size-12 [&_svg]:size-full"}>
            <svg
              width="48"
              height="49"
              viewBox="0 0 48 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: "drop-shadow(0px 0px 32px rgba(91, 12, 200, 0.75))",
              }}
            >
              <path
                d="M26.8649 32.9012C28.132 32.5616 28.8291 31.0538 28.4216 29.5331C28.0142 28.0127 26.6567 27.0552 25.3896 27.3947C24.1225 27.7343 23.4253 29.2423 23.8329 30.7627C24.2402 32.2834 25.5978 33.2407 26.8649 32.9012Z"
                fill="url(#paint0_linear_554_4956)"
              />
              <path
                d="M37.4853 33.99C37.7569 35.0035 36.7444 36.1557 35.224 36.5631C33.7033 36.9704 32.2504 36.4791 31.9789 35.4653C31.7073 34.4515 32.7198 33.2995 34.2402 32.8922C35.7609 32.4846 37.2138 32.9762 37.4853 33.99Z"
                fill="url(#paint1_linear_554_4956)"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.44444 4C5.98984 4 4 5.98984 4 8.44444V39.5556C4 42.0102 5.98984 44 8.44444 44H39.5556C42.0102 44 44 42.0102 44 39.5556V8.44444C44 5.98984 42.0102 4 39.5556 4H8.44444ZM30.3927 18.0418C28.4604 18.5595 26.6749 19.3145 25.0787 20.2504L17.2876 18.4414C16.5097 18.2607 15.801 18.9352 15.9429 19.7211L17.5947 28.8682C16.8753 30.9667 16.7411 33.1709 17.316 35.3167C17.6526 36.5729 18.2097 37.7249 18.9494 38.7567C19.3258 39.2818 19.9502 39.5556 20.5962 39.5556H37.3333C38.5607 39.5556 39.5556 38.5607 39.5556 37.3333V29.2056C38.6704 28.9647 37.8902 28.164 37.598 27.074C37.1907 25.5533 37.8876 24.0456 39.1547 23.706C39.2878 23.6704 39.4218 23.6491 39.5556 23.6411V14.5192C39.5556 14.3237 39.3213 14.2235 39.18 14.3584L36.0996 17.2975C34.2491 17.2851 32.3251 17.524 30.3927 18.0418Z"
                fill="url(#paint2_linear_554_4956)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_554_4956"
                  x1="26.1272"
                  y1="27.3263"
                  x2="26.1272"
                  y2="32.9696"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#A56BF6" />
                  <stop offset="1" stopColor="#3C0090" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_554_4956"
                  x1="34.7321"
                  y1="32.7489"
                  x2="34.7321"
                  y2="36.7063"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#A56BF6" />
                  <stop offset="1" stopColor="#3C0090" />
                </linearGradient>
                <linearGradient
                  id="paint2_linear_554_4956"
                  x1="24"
                  y1="4"
                  x2="24"
                  y2="44"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#AB6FFF" />
                  <stop offset="1" stopColor="#5B0CC8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <span
            className={
              "-mt-1 text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            {data.sent_image_message_count + data.sent_video_message_count}
          </span>
          <h4
            className={
              "-mt-1 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            发送图片/视频
          </h4>
        </div>

        <div
          className={
            "col-span-4 p-4 flex flex-col justify-center items-center bg-white/95 rounded-3xl overflow-hidden clothoid-corner-6"
          }
        >
          <div className={"size-12 [&_svg]:size-full"}>
            <svg
              width="48"
              height="49"
              viewBox="0 0 48 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: "drop-shadow(0px 0px 32px rgba(255, 225, 110, 1))",
              }}
            >
              <path
                d="M4 23.7C4 16.9794 4 13.6191 5.30792 11.0521C6.4584 8.79417 8.29417 6.9584 10.5521 5.80792C13.1191 4.5 16.4794 4.5 23.2 4.5H29C31.7879 4.5 33.1819 4.5 34.3411 4.73058C39.1014 5.67746 42.8225 9.39863 43.7694 14.1589C44 15.3181 44 16.7121 44 19.5V19.5C44 24.1466 44 26.4698 43.6157 28.4018C42.0376 36.3356 35.8356 42.5376 27.9018 44.1157C25.9698 44.5 23.6466 44.5 19 44.5V44.5C16.2121 44.5 14.8181 44.5 13.6589 44.2694C8.89863 43.3225 5.17746 39.6014 4.23058 34.8411C4 33.6819 4 32.2879 4 29.5V23.7Z"
                fill="url(#paint0_linear_528_395)"
              />
              <path
                d="M16.5263 16.5C17.019 16.5 17.5006 16.6461 17.9103 16.9199C18.32 17.1936 18.6393 17.5827 18.8279 18.0379C19.0164 18.4931 19.0658 18.994 18.9696 19.4773C18.8735 19.9605 18.6362 20.4044 18.2878 20.7528C17.9394 21.1012 17.4955 21.3385 17.0123 21.4346C16.529 21.5307 16.0281 21.4814 15.5729 21.2929C15.1177 21.1043 14.7286 20.785 14.4549 20.3753C14.1811 19.9656 14.035 19.484 14.035 18.9912C14.035 18.3305 14.2975 17.6969 14.7647 17.2297C15.2319 16.7625 15.8655 16.5 16.5263 16.5ZM33.7408 28.9562C31.6045 32.6495 28.0545 34.7691 24 34.7691C19.9455 34.7691 16.3955 32.6516 14.2592 28.9562C14.1391 28.7672 14.0584 28.5558 14.022 28.3348C13.9857 28.1138 13.9944 27.8877 14.0477 27.6701C14.101 27.4525 14.1977 27.248 14.3321 27.0688C14.4665 26.8896 14.6358 26.7394 14.8297 26.6273C15.0236 26.5152 15.2382 26.4435 15.4606 26.4165C15.6829 26.3895 15.9084 26.4078 16.1236 26.4702C16.3387 26.5326 16.539 26.6379 16.7124 26.7797C16.8857 26.9215 17.0286 27.0969 17.1325 27.2954C18.6833 29.9756 21.1205 31.4475 24 31.4475C26.8795 31.4475 29.3167 29.9735 30.8675 27.2954C30.9714 27.0969 31.1143 26.9215 31.2876 26.7797C31.461 26.6379 31.6613 26.5326 31.8764 26.4702C32.0916 26.4078 32.3171 26.3895 32.5394 26.4165C32.7618 26.4435 32.9764 26.5152 33.1703 26.6273C33.3643 26.7394 33.5335 26.8896 33.6679 27.0688C33.8023 27.248 33.899 27.4525 33.9523 27.6701C34.0056 27.8877 34.0143 28.1138 33.978 28.3348C33.9416 28.5558 33.8609 28.7672 33.7408 28.9562ZM31.4737 21.4825C30.981 21.4825 30.4994 21.3364 30.0897 21.0626C29.68 20.7889 29.3607 20.3998 29.1721 19.9446C28.9836 19.4894 28.9342 18.9885 29.0304 18.5052C29.1265 18.022 29.3638 17.5781 29.7122 17.2297C30.0606 16.8813 30.5045 16.644 30.9877 16.5479C31.471 16.4517 31.9719 16.5011 32.4271 16.6896C32.8823 16.8782 33.2714 17.1975 33.5451 17.6072C33.8189 18.0169 33.965 18.4985 33.965 18.9912C33.965 19.652 33.7025 20.2856 33.2353 20.7528C32.7681 21.22 32.1345 21.4825 31.4737 21.4825Z"
                fill="url(#paint1_linear_528_395)"
              />
              <g filter="url(#filter0_d_528_395)">
                <path
                  d="M44 23.5C44 24.4299 44 24.895 43.8978 25.2764C43.6204 26.3118 42.8117 27.1204 41.7764 27.3977C41.5598 27.4558 41.3163 27.481 40.976 27.4917C40.7169 27.5 40.4019 27.5 40 27.5C32.8203 27.5 27 33.3203 27 40.5C27 41.4299 27 41.895 26.8978 42.2764C26.6204 43.3118 25.8117 44.1204 24.7764 44.3977C24.395 44.5 23.93 44.5 23 44.5H24C35.0457 44.5 44 35.5457 44 24.5V23.5Z"
                  fill="url(#paint2_linear_528_395)"
                />
              </g>
              <defs>
                <filter
                  id="filter0_d_528_395"
                  x="22"
                  y="22.5"
                  width="23"
                  height="23"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset />
                  <feGaussianBlur stdDeviation="0.5" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_528_395"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_528_395"
                    result="shape"
                  />
                </filter>
                <linearGradient
                  id="paint0_linear_528_395"
                  x1="24"
                  y1="4.5"
                  x2="24"
                  y2="44.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FFD735" />
                  <stop offset="1" stopColor="#FFE167" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_528_395"
                  x1="24"
                  y1="16.5"
                  x2="24"
                  y2="34.7691"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3E3E3E" />
                  <stop offset="1" />
                </linearGradient>
                <linearGradient
                  id="paint2_linear_528_395"
                  x1="23"
                  y1="23.5"
                  x2="44"
                  y2="44.5"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FFDE25" />
                  <stop offset="1" stopColor="#9C7200" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <span
            className={
              "-mt-1 text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            {data.sent_sticker_message_count}
          </span>
          <h4
            className={
              "-mt-1 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            表情包使用次数
          </h4>
        </div>

        <div
          className={
            "col-span-4 p-4 flex flex-col justify-center items-center bg-white/95 rounded-3xl overflow-hidden clothoid-corner-6"
          }
        >
          <div className={"size-12 p-1"}>
            {mostUsedWxemoji && (
              <div className={"relative size-full [&_img]:size-full"}>
                <Image
                  src={mostUsedWxemojiSrc}
                  alt={mostUsedWxemojiKey}
                  className={"absolute z-0 inset-0 blur-lg opacity-90"}
                  aria-hidden
                />
                <Image
                  src={mostUsedWxemojiSrc}
                  alt={mostUsedWxemojiKey}
                  className={"relative"}
                />
              </div>
            )}
          </div>

          <span
            className={
              "-mt-1 text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            {mostUsedWxemoji?.count}
          </span>
          <h4
            className={
              "-mt-1 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            最多使用的微信表情
          </h4>
        </div>

        <div
          className={
            "col-span-7 p-4 flex flex-col justify-center items-center bg-white/95 rounded-3xl overflow-hidden clothoid-corner-6"
          }
        >
          <div className={"relative size-12 [&_svg]:size-full"}>
            <svg
              width="48"
              height="49"
              viewBox="0 0 48 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: "drop-shadow(0px 0px 32px rgba(70, 138, 255, 1))",
              }}
            >
              <path
                d="M15.6667 15.3973C15.6667 10.7949 19.3976 7.06396 24 7.06396C28.6024 7.06396 32.3333 10.7949 32.3333 15.3973V22.8973C32.3333 27.4997 28.6024 31.2306 24 31.2306C19.3976 31.2306 15.6667 27.4997 15.6667 22.8973V15.3973Z"
                fill="url(#paint0_linear_528_411)"
              />
              <path
                d="M12.0267 24.9632C12.6914 24.7768 13.3814 25.1645 13.5678 25.8293C14.8463 30.3889 19.0345 33.7306 24 33.7306C28.9655 33.7306 33.1537 30.3889 34.4322 25.8293C34.6186 25.1645 35.3086 24.7768 35.9733 24.9632C36.638 25.1496 37.0258 25.8395 36.8394 26.5042C35.3746 31.7279 30.8085 35.6561 25.25 36.1728V39.9167H29C29.6903 39.9167 30.25 40.4764 30.25 41.1667C30.25 41.8571 29.6903 42.4167 29 42.4167H19C18.3096 42.4167 17.75 41.8571 17.75 41.1667C17.75 40.4764 18.3096 39.9167 19 39.9167H22.75V36.1728C17.1915 35.6561 12.6253 31.7279 11.1606 26.5042C10.9742 25.8395 11.362 25.1496 12.0267 24.9632Z"
                fill="url(#paint1_linear_528_411)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_528_411"
                  x1="24"
                  y1="7.06396"
                  x2="24"
                  y2="42.4167"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#478AFF" />
                  <stop offset="1" stopColor="#2557AD" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_528_411"
                  x1="24"
                  y1="7.06396"
                  x2="24"
                  y2="42.4167"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#478AFF" />
                  <stop offset="1" stopColor="#2557AD" />
                </linearGradient>
              </defs>
            </svg>

            <div
              className={
                "z-0 absolute -top-1 right-0 bottom-0 left-0 grid place-content-center pointer-events-none"
              }
            >
              <div
                style={{
                  width: 132,
                  height: 170,
                  background: ` center / cover no-repeat url(${voice_background})`,
                }}
              />
            </div>
          </div>

          <span
            className={
              "-mt-1 text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            {voiceDurationDisplay}
          </span>
          <h4
            className={
              "-mt-1 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            发送语音总时长
          </h4>
        </div>

        <div
          className={
            "col-span-5 p-4 flex flex-col justify-center items-center bg-white/95 rounded-3xl overflow-hidden clothoid-corner-6"
          }
        >
          <div className={"relative size-12 [&_svg]:size-full"}>
            <svg
              width="48"
              height="49"
              viewBox="0 0 48 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: "drop-shadow(0px 0px 32px rgba(235, 55, 55, 1))",
              }}
            >
              <path
                d="M41.9225 5.32006C41.7437 5.17835 41.5346 5.0799 41.3115 5.03241C41.0883 4.98492 40.8572 4.98968 40.6363 5.04631L16.6363 11.0463C16.3121 11.1273 16.0242 11.3143 15.8184 11.5776C15.6125 11.8408 15.5005 12.1653 15.5 12.4994V33.1432C14.2486 32.307 12.7536 31.9131 11.2526 32.024C9.75157 32.1349 8.33071 32.7443 7.21576 33.7554C6.10082 34.7664 5.35575 36.121 5.09897 37.6041C4.84219 39.0871 5.08842 40.6134 5.79854 41.9404C6.50866 43.2674 7.64192 44.3191 9.01824 44.9282C10.3946 45.5373 11.935 45.669 13.3947 45.3022C14.8544 44.9355 16.1497 44.0914 17.0747 42.9042C17.9997 41.7169 18.5014 40.2545 18.5 38.7494V21.1713L39.5 15.9213V27.1432C38.2486 26.307 36.7536 25.9131 35.2526 26.024C33.7516 26.1349 32.3307 26.7443 31.2158 27.7554C30.1008 28.7664 29.3558 30.121 29.099 31.6041C28.8422 33.0871 29.0884 34.6134 29.7985 35.9404C30.5087 37.2674 31.6419 38.3191 33.0182 38.9282C34.3946 39.5373 35.935 39.669 37.3947 39.3022C38.8544 38.9355 40.1497 38.0914 41.0747 36.9042C41.9997 35.7169 42.5014 34.2545 42.5 32.7494V6.49944C42.4995 6.27193 42.4472 6.04752 42.3472 5.8432C42.2471 5.63887 42.1019 5.45998 41.9225 5.32006Z"
                fill="black"
              />
              <path
                d="M41.9225 5.32006C41.7437 5.17835 41.5346 5.0799 41.3115 5.03241C41.0883 4.98492 40.8572 4.98968 40.6363 5.04631L16.6363 11.0463C16.3121 11.1273 16.0242 11.3143 15.8184 11.5776C15.6125 11.8408 15.5005 12.1653 15.5 12.4994V33.1432C14.2486 32.307 12.7536 31.9131 11.2526 32.024C9.75157 32.1349 8.33071 32.7443 7.21576 33.7554C6.10082 34.7664 5.35575 36.121 5.09897 37.6041C4.84219 39.0871 5.08842 40.6134 5.79854 41.9404C6.50866 43.2674 7.64192 44.3191 9.01824 44.9282C10.3946 45.5373 11.935 45.669 13.3947 45.3022C14.8544 44.9355 16.1497 44.0914 17.0747 42.9042C17.9997 41.7169 18.5014 40.2545 18.5 38.7494V21.1713L39.5 15.9213V27.1432C38.2486 26.307 36.7536 25.9131 35.2526 26.024C33.7516 26.1349 32.3307 26.7443 31.2158 27.7554C30.1008 28.7664 29.3558 30.121 29.099 31.6041C28.8422 33.0871 29.0884 34.6134 29.7985 35.9404C30.5087 37.2674 31.6419 38.3191 33.0182 38.9282C34.3946 39.5373 35.935 39.669 37.3947 39.3022C38.8544 38.9355 40.1497 38.0914 41.0747 36.9042C41.9997 35.7169 42.5014 34.2545 42.5 32.7494V6.49944C42.4995 6.27193 42.4472 6.04752 42.3472 5.8432C42.2471 5.63887 42.1019 5.45998 41.9225 5.32006Z"
                fill="url(#paint0_linear_543_4706)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_543_4706"
                  x1="23.75"
                  y1="5"
                  x2="23.75"
                  y2="45.5057"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FE4E4E" />
                  <stop offset="1" stopColor="#CD3232" />
                </linearGradient>
              </defs>
            </svg>

            <div
              className={
                "z-0 absolute top-3 right-0 bottom-0 left-0 grid place-content-center pointer-events-none"
              }
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  background: ` center / cover no-repeat url(${music_background})`,
                }}
              />
            </div>
          </div>

          <span
            className={
              "-mt-1 text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            {data.sent_music_message_count}
          </span>
          <h4
            className={
              "-mt-1 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            分享音乐
          </h4>
        </div>

        <div
          className={
            "col-span-5 p-4 flex flex-col justify-center items-center bg-white/95 rounded-3xl overflow-hidden clothoid-corner-6"
          }
        >
          <div className={"size-12 [&_svg]:size-full"}>
            <svg
              width="48"
              height="49"
              viewBox="0 0 48 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M42.7 41.6046C42.8677 41.8275 42.9699 42.0927 42.9952 42.3704C43.0205 42.6481 42.9679 42.9274 42.8433 43.1769C42.7186 43.4264 42.5269 43.6362 42.2896 43.7827C42.0523 43.9293 41.7789 44.0068 41.5 44.0065H5.5C5.22143 44.0065 4.94837 43.9289 4.7114 43.7825C4.47444 43.636 4.28294 43.4265 4.15836 43.1773C4.03378 42.9282 3.98104 42.6492 4.00606 42.3718C4.03108 42.0944 4.13286 41.8294 4.3 41.6065C5.62822 39.8257 7.39942 38.4237 9.4375 37.5396C8.32033 36.52 7.53755 35.1864 7.19191 33.7139C6.84626 32.2415 6.95389 30.6989 7.50068 29.2887C8.04748 27.8784 9.00787 26.6665 10.2558 25.8119C11.5038 24.9573 12.9809 24.5 14.4934 24.5C16.0059 24.5 17.4831 24.9573 18.7311 25.8119C19.979 26.6665 20.9394 27.8784 21.4862 29.2887C22.033 30.6989 22.1406 32.2415 21.795 33.7139C21.4493 35.1864 20.6665 36.52 19.5494 37.5396C21.0198 38.1752 22.356 39.0845 23.4869 40.219C24.6178 39.0845 25.954 38.1752 27.4244 37.5396C26.3072 36.52 25.5244 35.1864 25.1788 33.7139C24.8331 32.2415 24.9408 30.6989 25.4876 29.2887C26.0344 27.8784 26.9947 26.6665 28.2427 25.8119C29.4906 24.9573 30.9678 24.5 32.4803 24.5C33.9928 24.5 35.47 24.9573 36.7179 25.8119C37.9659 26.6665 38.9263 27.8784 39.4731 29.2887C40.0199 30.6989 40.1275 32.2415 39.7818 33.7139C39.4362 35.1864 38.6534 36.52 37.5363 37.5396C39.5838 38.419 41.3645 39.8208 42.7 41.6046ZM4.6 24.2065C4.75759 24.3247 4.93691 24.4107 5.12773 24.4596C5.31855 24.5085 5.51713 24.5193 5.71213 24.4914C5.90714 24.4636 6.09474 24.3976 6.26424 24.2972C6.43374 24.1969 6.58181 24.0641 6.7 23.9065C7.60818 22.6956 8.78583 21.7128 10.1397 21.0358C11.4935 20.3589 12.9864 20.0065 14.5 20.0065C16.0136 20.0065 17.5065 20.3589 18.8603 21.0358C20.2142 21.7128 21.3918 22.6956 22.3 23.9065C22.4397 24.0928 22.6209 24.244 22.8292 24.3481C23.0375 24.4523 23.2671 24.5065 23.5 24.5065C23.7329 24.5065 23.9625 24.4523 24.1708 24.3481C24.3791 24.244 24.5603 24.0928 24.7 23.9065C25.6082 22.6956 26.7858 21.7128 28.1397 21.0358C29.4935 20.3589 30.9864 20.0065 32.5 20.0065C34.0136 20.0065 35.5065 20.3589 36.8603 21.0358C38.2142 21.7128 39.3918 22.6956 40.3 23.9065C40.4183 24.0641 40.5665 24.1968 40.7361 24.2971C40.9057 24.3975 41.0934 24.4634 41.2885 24.4912C41.4836 24.5189 41.6823 24.508 41.8731 24.459C42.064 24.41 42.2433 24.3239 42.4009 24.2056C42.5585 24.0873 42.6913 23.9391 42.7916 23.7695C42.8919 23.5998 42.9578 23.4121 42.9856 23.217C43.0134 23.0219 43.0024 22.8233 42.9534 22.6324C42.9044 22.4416 42.8183 22.2622 42.7 22.1046C41.3717 20.3244 39.6005 18.9229 37.5625 18.0396C38.6797 17.02 39.4624 15.6864 39.8081 14.2139C40.1537 12.7415 40.0461 11.1989 39.4993 9.78866C38.9525 8.37844 37.9921 7.1665 36.7442 6.3119C35.4962 5.45731 34.0191 5 32.5066 5C30.9941 5 29.5169 5.45731 28.2689 6.3119C27.021 7.1665 26.0606 8.37844 25.5138 9.78866C24.967 11.1989 24.8594 12.7415 25.205 14.2139C25.5507 15.6864 26.3335 17.02 27.4506 18.0396C25.9802 18.6752 24.644 19.5845 23.5131 20.719C22.3822 19.5845 21.046 18.6752 19.5756 18.0396C20.6928 17.02 21.4756 15.6864 21.8212 14.2139C22.1669 12.7415 22.0592 11.1989 21.5124 9.78866C20.9656 8.37844 20.0053 7.1665 18.7573 6.3119C17.5094 5.45731 16.0322 5 14.5197 5C13.0072 5 11.53 5.45731 10.2821 6.3119C9.03412 7.1665 8.07373 8.37844 7.52693 9.78866C6.98014 11.1989 6.87251 12.7415 7.21816 14.2139C7.5638 15.6864 8.34658 17.02 9.46375 18.0396C7.41611 18.9197 5.63547 20.3221 4.3 22.1065C4.18181 22.2641 4.09582 22.4434 4.04693 22.6342C3.99804 22.8251 3.98722 23.0236 4.01508 23.2186C4.04293 23.4136 4.10893 23.6012 4.20929 23.7707C4.30965 23.9402 4.44241 24.0883 4.6 24.2065Z"
                fill="url(#paint0_linear_536_408)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_536_408"
                  x1="23.5007"
                  y1="5"
                  x2="23.5007"
                  y2="44.0065"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#565656" />
                  <stop offset="1" stopColor="#1B1B1B" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span
            className={
              "-mt-1 text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            {data.chat_message_count.length}
          </span>
          <h4
            className={
              "-mt-1 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            联系过的人和群组
          </h4>
        </div>

        <div
          className={
            "col-span-7 p-4 relative flex flex-col justify-center items-center bg-white/95 rounded-3xl overflow-hidden clothoid-corner-6"
          }
        >
          <div
            className={"absolute z-0 inset-0"}
            style={{
              background: ` center / cover no-repeat url(${widget_friends_background})`,
            }}
          />
          <div className={"relative z-10 size-12 [&_svg]:size-full"}>
            <svg
              width="48"
              height="49"
              viewBox="0 0 48 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M38.2672 19.8843C39.1957 21.447 39.8051 23.1783 40.0601 24.9781C40.3152 26.7779 40.2109 28.6103 39.7532 30.3695C39.2956 32.1287 38.4936 33.7797 37.3938 35.227C36.294 36.6742 34.9181 37.8891 33.3458 38.8012C31.7735 39.7133 30.0359 40.3046 28.2335 40.5409C26.4312 40.7772 24.5999 40.6538 22.8456 40.1778C21.0913 39.7018 19.4488 38.8827 18.0131 37.7678C16.5773 36.653 15.3769 35.2645 14.4812 33.6827L8.08593 22.6062C7.78172 22.0342 7.71142 21.3665 7.88984 20.7437C8.06825 20.1209 8.48146 19.5917 9.04238 19.2676C9.60331 18.9435 10.2681 18.8498 10.8968 19.0062C11.5255 19.1626 12.0689 19.557 12.4125 20.1062L15.3125 25.1249C15.3946 25.2671 15.5039 25.3917 15.6341 25.4917C15.7643 25.5917 15.913 25.665 16.0716 25.7075C16.2302 25.75 16.3956 25.7609 16.5584 25.7395C16.7211 25.7181 16.8781 25.6648 17.0203 25.5827C17.1625 25.5006 17.2871 25.3914 17.3871 25.2611C17.4871 25.1309 17.5604 24.9822 17.6029 24.8236C17.6454 24.665 17.6563 24.4996 17.6349 24.3369C17.6135 24.1741 17.5602 24.0171 17.4781 23.8749L11.3437 13.2499C11.0395 12.6779 10.9692 12.0102 11.1476 11.3874C11.3261 10.7647 11.7393 10.2355 12.3002 9.91133C12.8611 9.58722 13.526 9.4935 14.1546 9.64993C14.7833 9.80635 15.3267 10.2007 15.6703 10.7499L21.8125 21.3749C21.8921 21.5216 22.0004 21.6508 22.1308 21.755C22.2612 21.8592 22.4112 21.9362 22.5718 21.9815C22.7325 22.0268 22.9006 22.0395 23.0662 22.0187C23.2319 21.998 23.3917 21.9443 23.5362 21.8608C23.6807 21.7773 23.8071 21.6657 23.9078 21.5326C24.0085 21.3995 24.0816 21.2476 24.1226 21.0858C24.1637 20.924 24.1719 20.7556 24.1468 20.5906C24.1217 20.4255 24.0638 20.2672 23.9766 20.1249L19.2891 11.9999C18.9672 11.4263 18.8844 10.749 19.0585 10.1148C19.2326 9.48056 19.6497 8.94048 20.2192 8.61161C20.7888 8.28274 21.465 8.19156 22.1014 8.35783C22.7377 8.5241 23.2829 8.93444 23.6187 9.4999L29.9375 20.4562C28.5403 21.8642 27.7543 23.7663 27.75 25.7499C27.7453 27.3734 28.2721 28.9539 29.25 30.2499C29.3475 30.384 29.4707 30.4974 29.6124 30.5834C29.7542 30.6695 29.9116 30.7265 30.0756 30.7511C30.2396 30.7757 30.4068 30.7674 30.5676 30.7267C30.7283 30.6861 30.8794 30.6138 31.0119 30.5142C31.1445 30.4146 31.2559 30.2897 31.3397 30.1466C31.4235 30.0035 31.478 29.8452 31.5 29.6808C31.522 29.5165 31.5111 29.3494 31.4679 29.1893C31.4247 29.0292 31.3501 28.8793 31.2484 28.7483C30.853 28.2204 30.566 27.6195 30.4039 26.9802C30.2417 26.3409 30.2077 25.6758 30.3037 25.0232C30.3997 24.3707 30.6238 23.7436 30.9632 23.178C31.3026 22.6125 31.7506 22.1197 32.2812 21.728C32.528 21.5454 32.699 21.2784 32.7615 20.9778C32.824 20.6773 32.7738 20.3642 32.6203 20.0983L30.8297 16.9999C30.5079 16.4263 30.425 15.749 30.5991 15.1148C30.7733 14.4806 31.1903 13.9405 31.7599 13.6116C32.3294 13.2827 33.0056 13.1916 33.642 13.3578C34.2783 13.5241 34.8235 13.9344 35.1594 14.4999L38.2672 19.8843ZM33.6781 10.978C34.554 11.2088 35.3752 11.6114 36.094 12.1624C36.8129 12.7133 37.4151 13.4017 37.8656 14.1874L37.9172 14.2765C38.0829 14.5636 38.356 14.7732 38.6763 14.8591C38.8349 14.9016 39.0003 14.9124 39.163 14.891C39.3258 14.8696 39.4828 14.8164 39.625 14.7343C39.7672 14.6522 39.8918 14.5429 39.9918 14.4127C40.0918 14.2824 40.1651 14.1338 40.2076 13.9752C40.2501 13.8166 40.261 13.6512 40.2396 13.4884C40.2181 13.3256 40.1649 13.1687 40.0828 13.0265L40.0312 12.9374C39.4169 11.8663 38.5958 10.9279 37.6157 10.1768C36.6356 9.42578 35.5159 8.87701 34.3219 8.5624C34.0025 8.47981 33.6633 8.52684 33.3785 8.69324C33.0936 8.85964 32.886 9.13192 32.8011 9.45071C32.7161 9.76951 32.7606 10.109 32.9249 10.3951C33.0892 10.6812 33.36 10.8907 33.6781 10.978ZM16.4344 39.7687C14.8146 38.4904 13.4543 36.9142 12.4266 35.1249C12.3445 34.9827 12.2352 34.8581 12.105 34.7581C11.9747 34.6581 11.8261 34.5848 11.6675 34.5423C11.5089 34.4998 11.3435 34.4889 11.1807 34.5103C11.0179 34.5318 10.8609 34.585 10.7187 34.6671C10.5765 34.7492 10.4519 34.8585 10.3519 34.9887C10.252 35.1189 10.1787 35.2676 10.1361 35.4262C10.0936 35.5848 10.0828 35.7502 10.1042 35.913C10.1256 36.0757 10.1789 36.2327 10.2609 36.3749C11.4473 38.4387 13.0171 40.2567 14.8859 41.7312C15.1466 41.9317 15.4758 42.0214 15.8021 41.9809C16.1285 41.9404 16.4258 41.7729 16.6295 41.5147C16.8332 41.2565 16.9269 40.9285 16.8904 40.6016C16.8539 40.2748 16.69 39.9755 16.4344 39.7687Z"
                fill="url(#paint0_linear_536_401)"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_536_401"
                  x1="24.0217"
                  y1="8.27661"
                  x2="24.0217"
                  y2="41.9904"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#565656" />
                  <stop offset="1" stopColor="#1B1B1B" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span
            className={
              "-mt-1 text-[2.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            {data.user_dates_contact_added.length}
          </span>
          <h4
            className={
              "-mt-1 text-sm font-medium text-transparent bg-clip-text bg-gradient-to-b from-[#262626] to-black"
            }
          >
            新朋友
          </h4>
        </div>
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
